"""
disputes/views.py
-----------------
Views for the Disputes app.

Endpoints:
  GET   /api/disputes/           → list all disputes (admin only)
  PATCH /api/disputes/<id>/resolve/  → resolve dispute + financial penalty (admin only)

Business rules:
- Only users with is_admin=True can access these endpoints
- Resolving a dispute:
    1. Sets dispute status to 'resolved'
    2. If penalty_amount provided → deduct from borrower's wallet and credit owner
    3. Records a Transaction of type 'deposit_penalty'
    4. Sets rental status back to 'returned' (dispute is over)
"""

from django.db import transaction
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Dispute
from rentals.models import Transaction


# ─────────────────────────────────────────────
# Permission helper
# ─────────────────────────────────────────────

class IsAdminUser(IsAuthenticated):
    """فقط کاربرانی که is_admin=True دارند."""
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.is_admin


# ─────────────────────────────────────────────
# Dispute List (admin only)
# ─────────────────────────────────────────────

class DisputeListView(APIView):
    """
    GET /api/disputes/
    Admin only — paginated list of all disputes, newest first.
    Optional filter: ?status=open|under_review|resolved
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        qs = Dispute.objects.select_related(
            'rental', 'rental__tool', 'raised_by', 'admin'
        ).order_by('-created_at')

        # فیلتر اختیاری بر اساس status
        status_filter = request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        from rest_framework.pagination import PageNumberPagination
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(qs, request)

        data = [_dispute_to_dict(d) for d in page]
        return paginator.get_paginated_response(data)


# ─────────────────────────────────────────────
# Dispute Resolve (admin only)
# ─────────────────────────────────────────────

class DisputeResolveView(APIView):
    """
    PATCH /api/disputes/<id>/resolve/

    Body:
      {
        "resolution": "توضیح تصمیم ادمین",
        "penalty_amount": 250000   ← اختیاری؛ اگر صفر یا نبود، ضمانت برمی‌گردد
      }

    منطق مالی:
    - اگر penalty_amount > 0:
        → از کیف پول قرض‌گیرنده کسر می‌شود و به صاحب ابزار می‌رسد
        → بقیه ضمانت (deposit_held - penalty_amount) به قرض‌گیرنده برمی‌گردد
    - اگر penalty_amount == 0 یا نبود:
        → کل ضمانت به قرض‌گیرنده برمی‌گردد (هیچ آسیبی ثابت نشد)
    """
    permission_classes = [IsAdminUser]

    def patch(self, request, dispute_id):
        try:
            dispute = Dispute.objects.select_related(
                'rental', 'rental__tool', 'rental__borrower',
                'rental__tool__owner',
            ).get(pk=dispute_id)
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

        resolution     = request.data.get('resolution', '').strip()
        penalty_raw    = request.data.get('penalty_amount', 0)

        if not resolution:
            return Response(
                {'status': 'error', 'message': 'resolution field is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            penalty_amount = int(penalty_raw)
            if penalty_amount < 0:
                raise ValueError
        except (ValueError, TypeError):
            return Response(
                {'status': 'error', 'message': 'penalty_amount must be a non-negative integer.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        rental   = dispute.rental
        borrower = rental.borrower
        owner    = rental.tool.owner
        deposit  = rental.deposit_held

        # جریمه نمی‌تواند از ضمانت بیشتر باشد
        if penalty_amount > deposit:
            return Response(
                {
                    'status': 'error',
                    'message': f'penalty_amount ({penalty_amount}) cannot exceed '
                               f'the deposit held ({deposit}).',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            # قفل کردن رکوردهای کاربران
            borrower_locked = (
                borrower.__class__._default_manager
                .select_for_update()
                .get(pk=borrower.pk)
            )
            owner_locked = (
                owner.__class__._default_manager
                .select_for_update()
                .get(pk=owner.pk)
            )

            if penalty_amount > 0:
                # ۱. کسر جریمه از ضمانت → به صاحب ابزار
                owner_locked.wallet_balance += penalty_amount
                owner_locked.save(update_fields=['wallet_balance'])

                Transaction.objects.create(
                    rental    = rental,
                    from_user = None,   # از escrow
                    to_user   = owner_locked,
                    amount    = penalty_amount,
                    type      = 'deposit_penalty',
                    note      = f'Penalty awarded to owner. Dispute #{dispute.id}. '
                                f'Resolution: {resolution}',
                )

                # ۲. باقی‌مانده ضمانت → به قرض‌گیرنده
                remainder = deposit - penalty_amount
                if remainder > 0:
                    borrower_locked.wallet_balance += remainder
                    borrower_locked.save(update_fields=['wallet_balance'])

                    Transaction.objects.create(
                        rental    = rental,
                        from_user = None,
                        to_user   = borrower_locked,
                        amount    = remainder,
                        type      = 'deposit_return',
                        note      = f'Partial deposit returned after dispute. '
                                    f'Dispute #{dispute.id}.',
                    )
            else:
                # هیچ جریمه‌ای نبود → کل ضمانت به قرض‌گیرنده برمی‌گردد
                borrower_locked.wallet_balance += deposit
                borrower_locked.save(update_fields=['wallet_balance'])

                Transaction.objects.create(
                    rental    = rental,
                    from_user = None,
                    to_user   = borrower_locked,
                    amount    = deposit,
                    type      = 'deposit_return',
                    note      = f'Full deposit returned after dispute resolved in borrower\'s favour. '
                                f'Dispute #{dispute.id}.',
                )

            # ۳. آپدیت Dispute
            dispute.status      = 'resolved'
            dispute.resolution  = resolution
            dispute.admin       = request.user
            dispute.resolved_at = timezone.now()
            dispute.save()

            # ۴. وضعیت رزرو → returned (اختلاف حل شد)
            rental.status = 'returned'
            rental.save(update_fields=['status', 'updated_at'])

        return Response({
            'status': 'success',
            'data'  : _dispute_to_dict(dispute),
        })


# ─────────────────────────────────────────────
# Helper
# ─────────────────────────────────────────────

def _dispute_to_dict(dispute):
    """تبدیل شیء Dispute به dict برای response."""
    return {
        'id'         : dispute.id,
        'rental'     : {
            'id'    : dispute.rental.id,
            'tool'  : dispute.rental.tool.name,
            'status': dispute.rental.status,
        },
        'raised_by'  : {
            'id'       : dispute.raised_by.id,
            'full_name': dispute.raised_by.full_name,
            'phone'    : dispute.raised_by.phone,
        },
        'reason'     : dispute.reason,
        'status'     : dispute.status,
        'resolution' : dispute.resolution,
        'admin'      : (
            {
                'id'       : dispute.admin.id,
                'full_name': dispute.admin.full_name,
            }
            if dispute.admin else None
        ),
        'resolved_at': dispute.resolved_at,
        'created_at' : dispute.created_at,
    }
