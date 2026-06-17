from django.shortcuts import render

"""
Dispute Views — همابزار
────────────────────────────────────────────────
Business rules:
  - فقط طرفین رزرو (borrower یا owner) می‌توانند شکایت ثبت کنند
  - رزرو باید در وضعیت returned یا active باشد تا شکایت قابل ثبت باشد
  - هر رزرو فقط یک شکایت می‌تواند داشته باشد (OneToOne)
  - فقط ادمین می‌تواند شکایت را resolve کند
  - هنگام resolve: penalty_amount از ضمانت borrower کسر و مابقی برمی‌گردد
  - رزرو پس از resolve به وضعیت 'disputed' می‌رود
  - همه عملیات مالی داخل transaction.atomic() انجام می‌شود
"""

from django.db import transaction
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Dispute
from .serializers import DisputeCreateSerializer, DisputeResolveSerializer, DisputeSerializer
from rentals.models import Rental, Transaction


# ─────────────────────────────────────────────
# Helper
# ─────────────────────────────────────────────

def get_rental_or_404(rental_id):
    try:
        return Rental.objects.select_related(
            'tool', 'tool__owner', 'borrower'
        ).get(pk=rental_id)
    except Rental.DoesNotExist:
        return None


def is_party(user, rental):
    return user.id in (rental.borrower_id, rental.tool.owner_id)


# ─────────────────────────────────────────────
# POST /api/rentals/<id>/dispute/
# ─────────────────────────────────────────────

class DisputeCreateView(APIView):
    """ثبت شکایت برای یک رزرو — توسط طرفین"""
    permission_classes = [IsAuthenticated]

    def post(self, request, rental_id):
        rental = get_rental_or_404(rental_id)
        if not rental:
            return Response(
                {'status': 'error', 'message': 'Rental not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # فقط طرفین رزرو
        if not is_party(request.user, rental):
            return Response(
                {'status': 'error', 'message': 'Access denied.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        # فقط در وضعیت active یا returned شکایت پذیرفته می‌شود
        if rental.status not in ('active', 'returned'):
            return Response(
                {
                    'status': 'error',
                    'message': 'Disputes can only be raised for active or returned rentals.',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # هر رزرو فقط یک شکایت
        if hasattr(rental, 'dispute'):
            return Response(
                {'status': 'error', 'message': 'A dispute has already been raised for this rental.'},
                status=status.HTTP_409_CONFLICT,
            )

        serializer = DisputeCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'status': 'error', 'message': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        dispute = Dispute.objects.create(
            rental    = rental,
            raised_by = request.user,
            reason    = serializer.validated_data['reason'],
            status    = 'open',
        )

        return Response(
            {'status': 'success', 'data': DisputeSerializer(dispute).data},
            status=status.HTTP_201_CREATED,
        )


# ─────────────────────────────────────────────
# GET /api/disputes/   (ادمین فقط)
# ─────────────────────────────────────────────

class DisputeListView(APIView):
    """لیست همه شکایت‌ها — فقط ادمین"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_admin:
            return Response(
                {'status': 'error', 'message': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        disputes = (
            Dispute.objects
            .select_related('rental', 'rental__tool', 'raised_by', 'admin')
            .order_by('-created_at')
        )

        # فیلتر اختیاری بر اساس status
        filter_status = request.query_params.get('status')
        if filter_status:
            disputes = disputes.filter(status=filter_status)

        serializer = DisputeSerializer(disputes, many=True)
        return Response({'status': 'success', 'results': serializer.data})


# ─────────────────────────────────────────────
# PATCH /api/disputes/<id>/resolve/   (ادمین فقط)
# ─────────────────────────────────────────────

class DisputeResolveView(APIView):
    """حل شکایت و تعیین جریمه — فقط ادمین"""
    permission_classes = [IsAuthenticated]

    def patch(self, request, dispute_id):
        if not request.user.is_admin:
            return Response(
                {'status': 'error', 'message': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            dispute = (
                Dispute.objects
                .select_related('rental', 'rental__tool', 'rental__tool__owner', 'rental__borrower')
                .get(pk=dispute_id)
            )
        except Dispute.DoesNotExist:
            return Response(
                {'status': 'error', 'message': 'Dispute not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if dispute.status == 'resolved':
            return Response(
                {'status': 'error', 'message': 'This dispute has already been resolved.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = DisputeResolveSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'status': 'error', 'message': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data           = serializer.validated_data
        penalty_amount = data.get('penalty_amount', 0)
        rental         = dispute.rental
        deposit        = rental.deposit_held

        # جریمه نمی‌تواند از مبلغ ضمانت بیشتر باشد
        if penalty_amount > deposit:
            return Response(
                {
                    'status': 'error',
                    'message': (
                        f'Penalty ({penalty_amount}) cannot exceed '
                        f'deposit amount ({deposit}).'
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        refund_to_borrower = deposit - penalty_amount

        with transaction.atomic():
            # قفل روی borrower و owner برای جلوگیری از race condition
            borrower = (
                rental.borrower.__class__._default_manager
                .select_for_update()
                .get(pk=rental.borrower_id)
            )
            owner = (
                rental.tool.owner.__class__._default_manager
                .select_for_update()
                .get(pk=rental.tool.owner_id)
            )

            # ۱. برگشت مابقی ضمانت به borrower
            if refund_to_borrower > 0:
                borrower.wallet_balance += refund_to_borrower
                borrower.save(update_fields=['wallet_balance'])

                Transaction.objects.create(
                    rental    = rental,
                    from_user = None,
                    to_user   = borrower,
                    amount    = refund_to_borrower,
                    type      = 'deposit_return',
                    note      = (
                        f'Partial deposit refund after dispute #{dispute.id} resolved. '
                        f'Penalty: {penalty_amount}'
                    ),
                )

            # ۲. انتقال جریمه به صاحب ابزار
            if penalty_amount > 0:
                owner.wallet_balance += penalty_amount
                owner.save(update_fields=['wallet_balance'])

                Transaction.objects.create(
                    rental    = rental,
                    from_user = None,
                    to_user   = owner,
                    amount    = penalty_amount,
                    type      = 'deposit_penalty',
                    note      = f'Penalty paid to owner from dispute #{dispute.id}.',
                )

            # ۳. آپدیت وضعیت رزرو به disputed
            rental.status = 'disputed'
            rental.save(update_fields=['status', 'updated_at'])

            # ۴. resolve کردن شکایت
            dispute.status         = 'resolved'
            dispute.resolution     = data['resolution']
            dispute.penalty_amount = penalty_amount
            dispute.admin          = request.user
            dispute.resolved_at    = timezone.now()
            dispute.save(update_fields=[
                'status', 'resolution', 'penalty_amount',
                'admin', 'resolved_at',
            ])

        return Response({'status': 'success', 'data': DisputeSerializer(dispute).data})

