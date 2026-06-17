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
    """Check if user is a party (owner or borrower) to this rental."""
    return user.id in (rental.borrower_id, rental.tool.owner_id)


def update_user_rating(user):
    """Update user's average rating from reviews."""
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
            # Date conflict → 409, other errors → 400
            if 'date_conflict' in serializer.errors:
                return Response(
                    {'status': 'error', 'message': serializer.errors['date_conflict'][0]},
                    status=status.HTTP_409_CONFLICT,
                )
            return Response(
                {'status': 'error', 'message': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data  = serializer.validated_data
        tool  = Tool.objects.select_related('owner').get(pk=data['tool_id'])
        borrower = request.user

        # User cannot rent their own tool
        if tool.owner == borrower:
            return Response(
                {'status': 'error', 'message': 'شما نمی‌توانید ابزار خودتان را اجاره کنید.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Calculate pricing
        days         = (data['end_date'] - data['start_date']).days
        total_price  = days * tool.daily_price
        deposit_held = tool.deposit_amount
        total_needed = total_price + deposit_held

        # Check wallet balance
        if borrower.wallet_balance < total_needed:
            return Response(
                {
                    'status': 'error',
                    'message': f'موجودی کیف پول کافی نیست. مبلغ مورد نیاز: {total_needed}، موجودی: {borrower.wallet_balance}',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Everything atomic — all or nothing
        with transaction.atomic():
            # Deduct from wallet
            borrower.wallet_balance -= total_needed
            borrower.save(update_fields=['wallet_balance'])

            # Create rental
            rental = Rental.objects.create(
                tool         = tool,
                borrower     = borrower,
                start_date   = data['start_date'],
                end_date     = data['end_date'],
                total_price  = total_price,
                deposit_held = deposit_held,
                status       = 'pending',
            )

            # Record financial transactions
            Transaction.objects.create(
                rental    = rental,
                from_user = borrower,
                to_user   = None,
                amount    = total_price,
                type      = 'rental_payment',
                note      = f'Rental payment for {tool.name}',
            )
            Transaction.objects.create(
                rental    = rental,
                from_user = borrower,
                to_user   = None,
                amount    = deposit_held,
                type      = 'deposit_hold',
                note      = f'Deposit hold for {tool.name}',
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
                {'status': 'error', 'message': 'رزرو پیدا نشد.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Only parties can view
        if not is_party(request.user, rental) and not request.user.is_admin:
            return Response(
                {'status': 'error', 'message': 'دسترسی غیرمجاز.'},
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
                {'status': 'error', 'message': 'رزرو پیدا نشد.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        if rental.tool.owner != request.user:
            return Response(
                {'status': 'error', 'message': 'فقط صاحب ابزار می‌تواند رزرو را تایید کند.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        if rental.status != 'pending':
            return Response(
                {'status': 'error', 'message': f'امکان تایید رزرو با وضعیت {rental.status} وجود ندارد.'},
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
                {'status': 'error', 'message': 'رزرو پیدا نشد.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        if rental.tool.owner != request.user:
            return Response(
                {'status': 'error', 'message': 'فقط صاحب ابزار می‌تواند تحویل را ثبت کند.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        if rental.status != 'confirmed':
            return Response(
                {'status': 'error', 'message': f'امکان تحویل رزرو با وضعیت {rental.status} وجود ندارد.'},
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
                {'status': 'error', 'message': 'رزرو پیدا نشد.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        if rental.tool.owner != request.user:
            return Response(
                {'status': 'error', 'message': 'فقط صاحب ابزار می‌تواند بازگشت را تایید کند.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        if rental.status != 'active':
            return Response(
                {'status': 'error', 'message': f'امکان بازگشت رزرو با وضعیت {rental.status} وجود ندارد.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            # Lock user records to prevent race conditions
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

            # 1. Return deposit to borrower
            borrower.wallet_balance += rental.deposit_held
            borrower.save(update_fields=['wallet_balance'])

            Transaction.objects.create(
                rental    = rental,
                from_user = None,
                to_user   = borrower,
                amount    = rental.deposit_held,
                type      = 'deposit_return',
                note      = 'Deposit returned after successful rental.',
            )

            # 2. Pay rental fee to tool owner (escrow release)
            owner.wallet_balance += rental.total_price
            owner.save(update_fields=['wallet_balance'])

            Transaction.objects.create(
                rental    = rental,
                from_user = None,
                to_user   = owner,
                amount    = rental.total_price,
                type      = 'rental_payment',
                note      = f'Rental income for "{rental.tool.name}" (Rental #{rental.id}).',
            )

            # 3. Update status
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
                {'status': 'error', 'message': 'رزرو پیدا نشد.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        is_borrower = request.user.id == rental.borrower_id
        is_owner    = request.user.id == rental.tool.owner_id

        if not is_borrower and not is_owner:
            return Response(
                {'status': 'error', 'message': 'دسترسی غیرمجاز.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        if rental.status != 'pending':
            return Response(
                {'status': 'error', 'message': 'فقط رزروهای در انتظار قابل لغو هستند.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            # Lock borrower record to prevent race condition
            borrower = (
                rental.borrower.__class__._default_manager
                .select_for_update()
                .get(pk=rental.borrower_id)
            )

            # Refund full amount (rental + deposit)
            refund = rental.total_price + rental.deposit_held
            borrower.wallet_balance += refund
            borrower.save(update_fields=['wallet_balance'])

            rental.status = 'cancelled'
            rental.save(update_fields=['status', 'updated_at'])

            # Two separate transactions for accounting clarity
            Transaction.objects.create(
                rental    = rental,
                from_user = None,
                to_user   = borrower,
                amount    = rental.total_price,
                type      = 'rental_payment',
                note      = 'Rental payment refunded on cancellation.',
            )
            Transaction.objects.create(
                rental    = rental,
                from_user = None,
                to_user   = borrower,
                amount    = rental.deposit_held,
                type      = 'deposit_return',
                note      = 'Deposit refunded on cancellation.',
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
                {'status': 'error', 'message': 'رزرو پیدا نشد.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        if not is_party(request.user, rental):
            return Response(
                {'status': 'error', 'message': 'دسترسی غیرمجاز.'},
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
                {'status': 'error', 'message': 'کاربر مورد نظر یافت نشد.'},
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

            # Lock record to prevent race condition on rating
            reviewed_locked = (
                reviewed.__class__._default_manager
                .select_for_update()
                .get(pk=reviewed.pk)
            )
            update_user_rating(reviewed_locked)

        return Response(
            {'status': 'success', 'message': 'امتیاز با موفقیت ثبت شد.'},
            status=status.HTTP_201_CREATED,
        )


# ─────────────────────────────────────────────
# Chat Messages
# ─────────────────────────────────────────────

class MessageListCreateView(APIView):
    """
    GET  /api/rentals/<id>/messages/ — polling every 5 seconds
    POST /api/rentals/<id>/messages/
    """
    permission_classes = [IsAuthenticated]

    def _check_access(self, user, rental):
        return is_party(user, rental) or user.is_admin

    def get(self, request, rental_id):
        rental = get_rental_or_404(rental_id)
        if not rental:
            return Response(
                {'status': 'error', 'message': 'رزرو پیدا نشد.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        if not self._check_access(request.user, rental):
            return Response(
                {'status': 'error', 'message': 'دسترسی غیرمجاز.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        messages = Message.objects.filter(rental=rental).select_related('sender')

        # Mark unread messages as read
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
                {'status': 'error', 'message': 'رزرو پیدا نشد.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        if not self._check_access(request.user, rental):
            return Response(
                {'status': 'error', 'message': 'دسترسی غیرمجاز.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        content = request.data.get('content', '').strip()
        if not content:
            return Response(
                {'status': 'error', 'message': 'متن پیام نمی‌تواند خالی باشد.'},
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