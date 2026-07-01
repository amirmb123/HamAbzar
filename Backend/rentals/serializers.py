"""
rentals/serializers.py
----------------------
Serializers for Rental, Transaction, and Review.

Design notes:
- RentalListSerializer  : compact, for list endpoints
- RentalDetailSerializer: full, for retrieve endpoint
- RentalCreateSerializer: write-only, validates dates and checks availability
- StatusActionSerializer: empty body actions (confirm, handover, return, cancel)
- ReviewCreateSerializer: validates rating range and prevents duplicate reviews
- MessageSerializer     : for chat messages
"""

from rest_framework import serializers
from django.utils import timezone
from .models import Rental, Transaction, Review
from chat.models import Message
from tools.models import Tool


# ─────────────────────────────────────────────
# Transaction — List (for a specific user's wallet history)
# ─────────────────────────────────────────────

class TransactionSerializer(serializers.ModelSerializer):
    """
    نمایش یک تراکنش از دید کاربر لاگین‌شده.
    - direction: آیا این تراکنش برای کاربر «واریز» بوده یا «برداشت»
    - counterparty: طرف مقابل تراکنش (اگر باشد)
    - tool_name / rental_id: برای لینک‌دادن به رزرو مربوطه در UI
    """
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    direction    = serializers.SerializerMethodField()
    counterparty = serializers.SerializerMethodField()
    tool_name    = serializers.CharField(source='rental.tool.name', read_only=True)
    rental_id    = serializers.IntegerField(source='rental.id', read_only=True)

    class Meta:
        model  = Transaction
        fields = [
            'id', 'type', 'type_display', 'direction', 'amount',
            'counterparty', 'rental_id', 'tool_name', 'note', 'created_at',
        ]
        read_only_fields = fields

    def get_direction(self, obj):
        user = self.context.get('request').user
        if obj.to_user_id == user.id:
            return 'credit'   # واریز به کیف پول کاربر
        return 'debit'        # برداشت از کیف پول کاربر

    def get_counterparty(self, obj):
        user = self.context.get('request').user
        other = obj.to_user if obj.from_user_id == user.id else obj.from_user
        if not other:
            return None
        return {'id': other.id, 'full_name': other.full_name}


# ─────────────────────────────────────────────
# Nested helpers (read-only snapshots)
# ─────────────────────────────────────────────

class ToolSnapshotSerializer(serializers.Serializer):
    """Tool information snapshot for rental display."""
    id             = serializers.IntegerField()
    name           = serializers.CharField()
    daily_price    = serializers.IntegerField()
    deposit_amount = serializers.IntegerField()


class UserSnapshotSerializer(serializers.Serializer):
    """User information snapshot for rental display."""
    id        = serializers.IntegerField()
    full_name = serializers.CharField()
    phone     = serializers.CharField()
    rating    = serializers.DecimalField(max_digits=3, decimal_places=1)


# ─────────────────────────────────────────────
# Rental — List (compact)
# ─────────────────────────────────────────────

class RentalListSerializer(serializers.ModelSerializer):
    tool     = ToolSnapshotSerializer(read_only=True)
    borrower = UserSnapshotSerializer(read_only=True)

    class Meta:
        model  = Rental
        fields = [
            'id', 'tool', 'borrower',
            'start_date', 'end_date',
            'total_price', 'deposit_held',
            'status', 'created_at',
        ]


# ─────────────────────────────────────────────
# Rental — Detail (full)
# ─────────────────────────────────────────────

class RentalDetailSerializer(serializers.ModelSerializer):
    tool     = ToolSnapshotSerializer(read_only=True)
    borrower = UserSnapshotSerializer(read_only=True)
    owner    = serializers.SerializerMethodField()

    class Meta:
        model  = Rental
        fields = [
            'id', 'tool', 'borrower', 'owner',
            'start_date', 'end_date',
            'total_price', 'deposit_held',
            'status', 'admin_note',
            'created_at', 'updated_at',
        ]

    def get_owner(self, obj):
        owner = obj.tool.owner
        return UserSnapshotSerializer(owner).data


# ─────────────────────────────────────────────
# Rental — Create
# ─────────────────────────────────────────────

class RentalCreateSerializer(serializers.Serializer):
    tool_id    = serializers.IntegerField()
    start_date = serializers.DateField()
    end_date   = serializers.DateField()

    def validate_tool_id(self, value):
        try:
            tool = Tool.objects.get(pk=value)
        except Tool.DoesNotExist:
            raise serializers.ValidationError("ابزار پیدا نشد.")
        if not tool.is_available:
            raise serializers.ValidationError("این ابزار برای اجاره در دسترس نیست.")
        return value

    def validate(self, attrs):
        start = attrs['start_date']
        end   = attrs['end_date']
        today = timezone.now().date()

        # Check that dates are reasonable.
        if start < today:
            raise serializers.ValidationError(
                {"start_date": "تاریخ شروع نمی‌تواند در گذشته باشد."}
            )
        if end <= start:
            raise serializers.ValidationError(
                {"end_date": "تاریخ پایان باید بعد از تاریخ شروع باشد."}
            )

        # Check tool availability for the selected dates.
        tool_id = attrs['tool_id']
        overlap = Rental.objects.filter(
            tool_id=tool_id,
            status__in=['pending', 'confirmed', 'active'],
            start_date__lte=end,
            end_date__gte=start,
        ).exists()
        if overlap:
            raise serializers.ValidationError(
                "این ابزار برای تاریخ‌های انتخاب شده رزرو شده است."
            )

        return attrs


# ─────────────────────────────────────────────
# Review — Create
# ─────────────────────────────────────────────

class ReviewCreateSerializer(serializers.Serializer):
    reviewed_id = serializers.IntegerField()
    rating      = serializers.IntegerField(min_value=1, max_value=5)
    comment     = serializers.CharField(required=False, allow_blank=True, default='')

    def validate(self, attrs):
        rental  = self.context['rental']
        request = self.context['request']
        user    = request.user

        # Reviews are only allowed after the tool has been returned.
        if rental.status != 'returned':
            raise serializers.ValidationError(
                "امتیازدهی فقط پس از بازگشت ابزار امکان‌پذیر است."
            )

        # Determine the other party based on user's role in the rental.
        is_borrower = user.id == rental.borrower_id
        is_owner    = user.id == rental.tool.owner_id

        if is_borrower:
            expected_reviewed_id = rental.tool.owner_id
        elif is_owner:
            expected_reviewed_id = rental.borrower_id
        else:
            # This case should not occur because is_party is checked in the view.
            raise serializers.ValidationError("دسترسی غیرمجاز.")

        # User must review the opposite party.
        if attrs['reviewed_id'] != expected_reviewed_id:
            raise serializers.ValidationError(
                "شما فقط می‌توانید به طرف مقابل این رزرو امتیاز دهید."
            )

        # Check if a review already exists from this user for this rental.
        already = Review.objects.filter(
            rental=rental,
            reviewer=user,
        ).exists()
        if already:
            raise serializers.ValidationError(
                "شما قبلاً برای این رزرو امتیاز ثبت کرده‌اید."
            )

        return attrs


# ─────────────────────────────────────────────
# Review — Public list (for tool detail page)
# ─────────────────────────────────────────────

class ToolReviewSerializer(serializers.ModelSerializer):
    """
    Read-only public representation of a review, used to list all reviews
    received for a given tool (across all of its past rentals).
    """
    reviewer_name = serializers.CharField(source='reviewer.full_name', read_only=True)

    class Meta:
        model  = Review
        fields = ['id', 'reviewer_name', 'rating', 'comment', 'created_at']


# ─────────────────────────────────────────────
# Message — List & Create
# ─────────────────────────────────────────────

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)

    class Meta:
        model  = Message
        fields = ['id', 'sender_name', 'content', 'is_read', 'created_at']
        read_only_fields = ['id', 'sender_name', 'is_read', 'created_at']