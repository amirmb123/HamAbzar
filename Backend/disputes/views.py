from django.shortcuts import render

"""
Dispute Views — Hamabzar
────────────────────────────────────────────────
Business rules:
  - Only the rental parties (borrower or owner) can file a dispute.
  - Rental must be in 'returned' or 'active' status to allow dispute creation.
  - Each rental can have only one dispute (OneToOne).
  - Only admin can resolve a dispute.
  - When resolving: penalty_amount is deducted from borrower's deposit and the remainder is refunded.
  - After resolution, the rental status changes to 'disputed'.
  - All financial operations are performed inside transaction.atomic().
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
    """Create a dispute for a rental — by involved parties."""
    permission_classes = [IsAuthenticated]

    def post(self, request, rental_id):
        rental = get_rental_or_404(rental_id)
        if not rental:
            return Response(
                {'status': 'error', 'message': 'رزرو پیدا نشد.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Only rental parties
        if not is_party(request.user, rental):
            return Response(
                {'status': 'error', 'message': 'دسترسی غیرمجاز.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Dispute allowed only in 'active' or 'returned' status
        if rental.status not in ('active', 'returned'):
            return Response(
                {
                    'status': 'error',
                    'message': 'شکایت فقط برای رزروهای فعال یا برگشت‌خورده قابل ثبت است.',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Only one dispute per rental
        if hasattr(rental, 'dispute'):
            return Response(
                {'status': 'error', 'message': 'برای این رزرو قبلاً شکایت ثبت شده است.'},
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
# GET /api/disputes/   (admin only)
# ─────────────────────────────────────────────

class DisputeListView(APIView):
    """List all disputes — admin only."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_admin:
            return Response(
                {'status': 'error', 'message': 'دسترسی ادمین لازم است.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        disputes = (
            Dispute.objects
            .select_related('rental', 'rental__tool', 'raised_by', 'admin')
            .order_by('-created_at')
        )

        # Optional filter by status
        filter_status = request.query_params.get('status')
        if filter_status:
            disputes = disputes.filter(status=filter_status)

        serializer = DisputeSerializer(disputes, many=True)
        return Response({'status': 'success', 'results': serializer.data})


# ─────────────────────────────────────────────
# PATCH /api/disputes/<id>/resolve/   (admin only)
# ─────────────────────────────────────────────

class DisputeResolveView(APIView):
    """Resolve a dispute and impose a penalty — admin only."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, dispute_id):
        if not request.user.is_admin:
            return Response(
                {'status': 'error', 'message': 'دسترسی ادمین لازم است.'},
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
                {'status': 'error', 'message': 'شکایت پیدا نشد.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if dispute.status == 'resolved':
            return Response(
                {'status': 'error', 'message': 'این شکایت قبلاً حل شده است.'},
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

        # Penalty must not exceed deposit amount
        if penalty_amount > deposit:
            return Response(
                {
                    'status': 'error',
                    'message': (
                        f'جریمه ({penalty_amount}) نمی‌تواند از مبلغ ضمانت ({deposit}) بیشتر باشد.'
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Two distinct scenarios:
        #   - rental.status == 'active'   → money is still in escrow, no payment/refund has occurred.
        #   - rental.status == 'returned' → deposit fully refunded to borrower and total_price
        #                                    fully paid to owner (in RentalReturnView).
        #                                    Here, "releasing deposit" is meaningless; penalty must
        #                                    be deducted directly from borrower's wallet_balance.
        rental_already_returned = (rental.status == 'returned')

        if rental_already_returned and penalty_amount > 0:
            # Ensure borrower has enough balance to cover the penalty, otherwise reject resolution
            borrower_balance_check = (
                rental.borrower.__class__._default_manager.get(pk=rental.borrower_id)
            )
            if borrower_balance_check.wallet_balance < penalty_amount:
                return Response(
                    {
                        'status': 'error',
                        'message': (
                            f'موجودی کیف پول قرض‌گیرنده ({borrower_balance_check.wallet_balance}) '
                            f'برای پوشش جریمه ({penalty_amount}) کافی نیست.'
                        ),
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        with transaction.atomic():
            # Lock borrower and owner to prevent race conditions
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

            if rental_already_returned:
                # ── Scenario 1: rental already returned — funds are final ──
                # Penalty is directly taken from borrower's wallet and given to owner.
                if penalty_amount > 0:
                    borrower.wallet_balance -= penalty_amount
                    borrower.save(update_fields=['wallet_balance'])

                    owner.wallet_balance += penalty_amount
                    owner.save(update_fields=['wallet_balance'])

                    Transaction.objects.create(
                        rental    = rental,
                        from_user = borrower,
                        to_user   = owner,
                        amount    = penalty_amount,
                        type      = 'deposit_penalty',
                        note      = (
                            f'Post-return penalty charged to borrower and paid to owner '
                            f'from dispute #{dispute.id}.'
                        ),
                    )
                # Note: deposit_held and total_price were already settled in RentalReturnView,
                # no additional payment is required.

            else:
                # ── Scenario 2: rental is still active — money is in escrow ──
                refund_to_borrower = deposit - penalty_amount

                # 1. Refund the remainder of the deposit to the borrower
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

                # 2. Transfer the penalty to the tool owner
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

                # 3. Pay the full rental price (total_price) to the tool owner — independent of penalty
                if rental.total_price > 0:
                    owner.wallet_balance += rental.total_price
                    owner.save(update_fields=['wallet_balance'])

                    Transaction.objects.create(
                        rental    = rental,
                        from_user = None,
                        to_user   = owner,
                        amount    = rental.total_price,
                        type      = 'rental_payment',
                        note      = f'Rental income for "{rental.tool.name}" after dispute #{dispute.id} resolved.',
                    )

            # 4. Update rental status to 'disputed'
            rental.status = 'disputed'
            rental.save(update_fields=['status', 'updated_at'])

            # 5. Resolve the dispute
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