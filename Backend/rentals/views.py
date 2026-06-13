"""
rentals/views.py
----------------
All views for the Rentals app.

Business rules enforced here:
  - Only authenticated users can create rentals
  - A user cannot rent their own tool
  - Wallet balance must cover rent + deposit
  - Status transitions are strictly controlled:
      pending   → confirmed  (owner only)
      confirmed → active     (owner only)
      active    → returned   (owner only)
      pending   → cancelled  (borrower or owner)
  - All money movements use transaction.atomic()
  - Reviews only allowed after status = returned
  - Chat only between the two parties + admin
"""

from django.db import transaction
from django.utils import timezone
from django.db.models import Avg, Count

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Rental, Transaction, Review
from .serializers import (
    RentalListSerializer,
    RentalDetailSerializer,
    RentalCreateSerializer,
    ReviewCreateSerializer,
    MessageSerializer,
)
from chat.models import Message
from accounts.models import User
from tools.models import Tool


# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────

def get_rental_or_404(rental_id):
    try:
        return Rental.objects.select_related(
            'tool', 'tool__owner', 'borrower'
        ).get(pk=rental_id)
    except Rental.DoesNotExist:
        return None


def is_party(user, rental):
    """آیا کاربر در این رزرو نقش داره؟ (صاحب یا کرایه‌گیرنده)"""
    return user.id in (rental.borrower_id, rental.tool.owner_id)


def update_user_rating(user):
    """میانگین rating کاربر رو از جدول reviews آپدیت کن"""
    result = Review.objects.filter(reviewed=user).aggregate(
        avg=Avg('rating'),
        cnt=Count('id'),
    )
    user.rating       = result['avg'] or 0.0
    user.rating_count = result['cnt']  or 0
    user.save(update_fields=['rating', 'rating_count'])


# ─────────────────────────────────────────────
# Create Rental
# ─────────────────────────────────────────────

class RentalCreateView(APIView):
    """POST /api/rentals/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = RentalCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'status': 'error', 'message': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data  = serializer.validated_data
        tool  = Tool.objects.select_related('owner').get(pk=data['tool_id'])
        borrower = request.user

        # نمیشه ابزار خودت رو کرایه کنی
        if tool.owner == borrower:
            return Response(
                {'status': 'error', 'message': 'You cannot rent your own tool.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # محاسبه قیمت
        days         = (data['end_date'] - data['start_date']).days
        total_price  = days * tool.daily_price
        deposit_held = tool.deposit_amount
        total_needed = total_price + deposit_held

        # بررسی موجودی کیف پول
        if borrower.wallet_balance < total_needed:
            return Response(
                {
                    'status': 'error',
                    'message': f'Insufficient wallet balance. '
                               f'Required: {total_needed}, Available: {borrower.wallet_balance}',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # همه چیز atomic — یا همه انجام میشه یا هیچ‌کدام
        with transaction.atomic():
            # کسر از کیف پول
            borrower.wallet_balance -= total_needed
            borrower.save(update_fields=['wallet_balance'])

            # ساخت rental
            rental = Rental.objects.create(
                tool         = tool,
                borrower     = borrower,
                start_date   = data['start_date'],
                end_date     = data['end_date'],
                total_price  = total_price,
                deposit_held = deposit_held,
                status       = 'pending',
            )

            # ثبت تراکنش‌های مالی
            Transaction.objects.create(
                rental = rental,
                user   = borrower,
                amount = total_price,
                type   = 'rental_payment',
                note   = f'Rental payment for {tool.name}',
            )
            Transaction.objects.create(
                rental = rental,
                user   = borrower,
                amount = deposit_held,
                type   = 'deposit_hold',
                note   = f'Deposit hold for {tool.name}',
            )

        return Response(
            {
                'status': 'success',
                'data'  : RentalDetailSerializer(rental).data,
            },
            status=status.HTTP_201_CREATED,
        )


# ─────────────────────────────────────────────
# My Rentals (as borrower)
# ─────────────────────────────────────────────

class MyRentalsView(APIView):
    """GET /api/rentals/my/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        rentals = Rental.objects.filter(
            borrower=request.user
        ).select_related('tool', 'tool__owner', 'borrower').order_by('-created_at')

        serializer = RentalListSerializer(rentals, many=True)
        return Response({'status': 'success', 'data': serializer.data})


# ─────────────────────────────────────────────
# My Tool Rentals (as owner)
# ─────────────────────────────────────────────

class MyToolRentalsView(APIView):
    """GET /api/rentals/my-tools/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        rentals = Rental.objects.filter(
            tool__owner=request.user
        ).select_related('tool', 'tool__owner', 'borrower').order_by('-created_at')

        serializer = RentalListSerializer(rentals, many=True)
        return Response({'status': 'success', 'data': serializer.data})


# ─────────────────────────────────────────────
# Rental Detail
# ─────────────────────────────────────────────

class RentalDetailView(APIView):
    """GET /api/rentals/<id>/"""
    permission_classes = [IsAuthenticated]

    def get(self, request, rental_id):
        rental = get_rental_or_404(rental_id)
        if not rental:
            return Response(
                {'status': 'error', 'message': 'Rental not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # فقط طرفین می‌تونن ببینن
        if not is_party(request.user, rental) and not request.user.is_admin:
            return Response(
                {'status': 'error', 'message': 'Access denied.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response(
            {'status': 'success', 'data': RentalDetailSerializer(rental).data}
        )


# ─────────────────────────────────────────────
# Status Transitions
# ─────────────────────────────────────────────

class RentalConfirmView(APIView):
    """POST /api/rentals/<id>/confirm/ — owner only"""
    permission_classes = [IsAuthenticated]

    def post(self, request, rental_id):
        rental = get_rental_or_404(rental_id)
        if not rental:
            return Response(
                {'status': 'error', 'message': 'Rental not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        if rental.tool.owner != request.user:
            return Response(
                {'status': 'error', 'message': 'Only the tool owner can confirm rentals.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        if rental.status != 'pending':
            return Response(
                {'status': 'error', 'message': f'Cannot confirm a rental with status: {rental.status}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        rental.status = 'confirmed'
        rental.save(update_fields=['status', 'updated_at'])
        return Response({'status': 'success', 'data': RentalDetailSerializer(rental).data})


class RentalHandoverView(APIView):
    """POST /api/rentals/<id>/handover/ — owner only → active"""
    permission_classes = [IsAuthenticated]

    def post(self, request, rental_id):
        rental = get_rental_or_404(rental_id)
        if not rental:
            return Response(
                {'status': 'error', 'message': 'Rental not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        if rental.tool.owner != request.user:
            return Response(
                {'status': 'error', 'message': 'Only the tool owner can mark handover.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        if rental.status != 'confirmed':
            return Response(
                {'status': 'error', 'message': f'Cannot hand over a rental with status: {rental.status}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        rental.status = 'active'
        rental.save(update_fields=['status', 'updated_at'])
        return Response({'status': 'success', 'data': RentalDetailSerializer(rental).data})


class RentalReturnView(APIView):
    """POST /api/rentals/<id>/return/ — owner only → returned + pay owner + release deposit"""
    permission_classes = [IsAuthenticated]

    def post(self, request, rental_id):
        rental = get_rental_or_404(rental_id)
        if not rental:
            return Response(
                {'status': 'error', 'message': 'Rental not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        if rental.tool.owner != request.user:
            return Response(
                {'status': 'error', 'message': 'Only the tool owner can confirm the return.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        if rental.status != 'active':
            return Response(
                {'status': 'error', 'message': f'Cannot return a rental with status: {rental.status}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            # قفل کردن رکوردهای کاربران برای جلوگیری از race condition
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

            # ۱. برگشت ضمانت به قرض‌گیرنده
            borrower.wallet_balance += rental.deposit_held
            borrower.save(update_fields=['wallet_balance'])

            Transaction.objects.create(
                rental = rental,
                user   = borrower,
                amount = rental.deposit_held,
                type   = 'deposit_return',
                note   = 'Deposit returned after successful rental.',
            )

            # ۲. پرداخت اجاره به صاحب ابزار (escrow release)
            owner.wallet_balance += rental.total_price
            owner.save(update_fields=['wallet_balance'])

            Transaction.objects.create(
                rental = rental,
                user   = owner,
                amount = rental.total_price,
                type   = 'rental_payment',
                note   = f'Rental income for "{rental.tool.name}" (Rental #{rental.id}).',
            )

            # ۳. تغییر وضعیت
            rental.status = 'returned'
            rental.save(update_fields=['status', 'updated_at'])

        return Response({'status': 'success', 'data': RentalDetailSerializer(rental).data})


class RentalCancelView(APIView):
    """POST /api/rentals/<id>/cancel/ — borrower or owner, only in pending"""
    permission_classes = [IsAuthenticated]

    def post(self, request, rental_id):
        rental = get_rental_or_404(rental_id)
        if not rental:
            return Response(
                {'status': 'error', 'message': 'Rental not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        is_borrower = request.user.id == rental.borrower_id
        is_owner    = request.user.id == rental.tool.owner_id

        if not is_borrower and not is_owner:
            return Response(
                {'status': 'error', 'message': 'Access denied.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        if rental.status != 'pending':
            return Response(
                {'status': 'error', 'message': 'Only pending rentals can be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            # قفل کردن رکورد قرض‌گیرنده برای جلوگیری از race condition
            borrower = (
                rental.borrower.__class__._default_manager
                .select_for_update()
                .get(pk=rental.borrower_id)
            )

            # برگشت کامل پول (اجاره + ضمانت)
            refund = rental.total_price + rental.deposit_held
            borrower.wallet_balance += refund
            borrower.save(update_fields=['wallet_balance'])

            rental.status = 'cancelled'
            rental.save(update_fields=['status', 'updated_at'])

            # دو تراکنش جداگانه برای شفافیت حسابداری
            Transaction.objects.create(
                rental = rental,
                user   = borrower,
                amount = rental.total_price,
                type   = 'rental_payment',
                note   = 'Rental payment refunded on cancellation.',
            )
            Transaction.objects.create(
                rental = rental,
                user   = borrower,
                amount = rental.deposit_held,
                type   = 'deposit_return',
                note   = 'Deposit refunded on cancellation.',
            )

        return Response({'status': 'success', 'data': RentalDetailSerializer(rental).data})


# ─────────────────────────────────────────────
# Reviews
# ─────────────────────────────────────────────

class ReviewCreateView(APIView):
    """POST /api/rentals/<id>/review/"""
    permission_classes = [IsAuthenticated]

    def post(self, request, rental_id):
        rental = get_rental_or_404(rental_id)
        if not rental:
            return Response(
                {'status': 'error', 'message': 'Rental not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        if not is_party(request.user, rental):
            return Response(
                {'status': 'error', 'message': 'Access denied.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ReviewCreateSerializer(
            data=request.data,
            context={'rental': rental, 'request': request},
        )
        if not serializer.is_valid():
            return Response(
                {'status': 'error', 'message': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data
        try:
            reviewed = User.objects.get(pk=data['reviewed_id'])
        except User.DoesNotExist:
            return Response(
                {'status': 'error', 'message': 'Reviewed user not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        with transaction.atomic():
            Review.objects.create(
                rental   = rental,
                reviewer = request.user,
                reviewed = reviewed,
                rating   = data['rating'],
                comment  = data.get('comment', ''),
            )

            # قفل رکورد برای جلوگیری از race condition روی rating
            reviewed_locked = (
                reviewed.__class__._default_manager
                .select_for_update()
                .get(pk=reviewed.pk)
            )
            update_user_rating(reviewed_locked)

        return Response(
            {'status': 'success', 'message': 'Review submitted successfully.'},
            status=status.HTTP_201_CREATED,
        )


# ─────────────────────────────────────────────
# Chat Messages
# ─────────────────────────────────────────────

class MessageListCreateView(APIView):
    """
    GET  /api/rentals/<id>/messages/ — polling هر ۵ ثانیه
    POST /api/rentals/<id>/messages/
    """
    permission_classes = [IsAuthenticated]

    def _check_access(self, user, rental):
        return is_party(user, rental) or user.is_admin

    def get(self, request, rental_id):
        rental = get_rental_or_404(rental_id)
        if not rental:
            return Response(
                {'status': 'error', 'message': 'Rental not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        if not self._check_access(request.user, rental):
            return Response(
                {'status': 'error', 'message': 'Access denied.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        messages = Message.objects.filter(rental=rental).select_related('sender')

        # علامت‌گذاری پیام‌های خوانده‌نشده
        Message.objects.filter(
            rental=rental,
            is_read=False,
        ).exclude(sender=request.user).update(is_read=True)

        serializer = MessageSerializer(messages, many=True)
        return Response({'status': 'success', 'data': serializer.data})

    def post(self, request, rental_id):
        rental = get_rental_or_404(rental_id)
        if not rental:
            return Response(
                {'status': 'error', 'message': 'Rental not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        if not self._check_access(request.user, rental):
            return Response(
                {'status': 'error', 'message': 'Access denied.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        content = request.data.get('content', '').strip()
        if not content:
            return Response(
                {'status': 'error', 'message': 'Message content cannot be empty.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        message = Message.objects.create(
            rental  = rental,
            sender  = request.user,
            content = content,
        )
        return Response(
            {'status': 'success', 'data': MessageSerializer(message).data},
            status=status.HTTP_201_CREATED,
        )