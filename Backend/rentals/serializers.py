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
# Nested helpers (read-only snapshots)
# ─────────────────────────────────────────────

class ToolSnapshotSerializer(serializers.Serializer):
    """فقط اطلاعات ابزار که داخل rental نشون داده میشه"""
    id             = serializers.IntegerField()
    name           = serializers.CharField()
    daily_price    = serializers.IntegerField()
    deposit_amount = serializers.IntegerField()


class UserSnapshotSerializer(serializers.Serializer):
    """فقط اطلاعات کاربر که داخل rental نشون داده میشه"""
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
            raise serializers.ValidationError("Tool not found.")
        if not tool.is_available:
            raise serializers.ValidationError("This tool is not available for rent.")
        return value

    def validate(self, attrs):
        start = attrs['start_date']
        end   = attrs['end_date']
        today = timezone.now().date()

        # تاریخ‌ها معقول هستند؟
        if start < today:
            raise serializers.ValidationError(
                {"start_date": "Start date cannot be in the past."}
            )
        if end <= start:
            raise serializers.ValidationError(
                {"end_date": "End date must be after start date."}
            )

        # ابزار در این بازه آزاده؟
        tool_id = attrs['tool_id']
        overlap = Rental.objects.filter(
            tool_id=tool_id,
            status__in=['pending', 'confirmed', 'active'],
            start_date__lte=end,
            end_date__gte=start,
        ).exists()
        if overlap:
            raise serializers.ValidationError(
                "This tool is already booked for the selected dates."
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

        # فقط بعد از returned میشه امتیاز داد
        if rental.status != 'returned':
            raise serializers.ValidationError(
                "Reviews can only be submitted after the tool is returned."
            )

        # نباید به خودت امتیاز بدی
        if attrs['reviewed_id'] == request.user.id:
            raise serializers.ValidationError(
                "You cannot review yourself."
            )

        # قبلاً امتیاز دادی؟
        already = Review.objects.filter(
            rental=rental,
            reviewer=request.user
        ).exists()
        if already:
            raise serializers.ValidationError(
                "You have already submitted a review for this rental."
            )

        return attrs


# ─────────────────────────────────────────────
# Message — List & Create
# ─────────────────────────────────────────────

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)

    class Meta:
        model  = Message
        fields = ['id', 'sender_name', 'content', 'is_read', 'created_at']
        read_only_fields = ['id', 'sender_name', 'is_read', 'created_at']