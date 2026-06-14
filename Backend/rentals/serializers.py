"""
rentals/serializers.py
----------------------
Serializers for Rental, Review, and Message models.

Design notes:
- RentalListSerializer  : compact view for list endpoints (my rentals, my-tools)
- RentalDetailSerializer: full view with nested tool + borrower info
- RentalCreateSerializer: validates create input (tool_id, dates, conflict check)
- ReviewCreateSerializer: validates review input (only after status=returned)
- MessageSerializer     : for chat messages inside a rental
"""

from rest_framework import serializers
from django.db.models import Q

from .models import Rental, Review
from chat.models import Message


# ─────────────────────────────────────────────
# Nested helpers
# ─────────────────────────────────────────────

class SimpleUserSerializer(serializers.Serializer):
    """Minimal user snapshot — avoids circular import with accounts."""
    id        = serializers.IntegerField()
    full_name = serializers.CharField()
    phone     = serializers.CharField()
    rating    = serializers.DecimalField(max_digits=3, decimal_places=1)
    avatar    = serializers.ImageField(allow_null=True)


class SimpleToolSerializer(serializers.Serializer):
    """Minimal tool snapshot for nested use inside rental responses."""
    id    = serializers.IntegerField()
    name  = serializers.CharField()
    daily_price    = serializers.IntegerField()
    deposit_amount = serializers.IntegerField()


# ─────────────────────────────────────────────
# Rental — List
# ─────────────────────────────────────────────

class RentalListSerializer(serializers.ModelSerializer):
    """
    Compact representation used in:
      GET /api/rentals/my/
      GET /api/rentals/my-tools/
    """
    tool     = SimpleToolSerializer(read_only=True)
    borrower = SimpleUserSerializer(read_only=True)

    class Meta:
        model  = Rental
        fields = [
            'id',
            'tool',
            'borrower',
            'start_date',
            'end_date',
            'total_price',
            'deposit_held',
            'status',
            'created_at',
        ]


# ─────────────────────────────────────────────
# Rental — Detail
# ─────────────────────────────────────────────

class RentalDetailSerializer(serializers.ModelSerializer):
    """
    Full representation used in:
      GET  /api/rentals/<id>/
      POST /api/rentals/               (response after create)
      POST /api/rentals/<id>/confirm/  (response after transition)
      POST /api/rentals/<id>/handover/ (response after transition)
      POST /api/rentals/<id>/return/   (response after transition)
      POST /api/rentals/<id>/cancel/   (response after transition)
    """
    tool     = SimpleToolSerializer(read_only=True)
    borrower = SimpleUserSerializer(read_only=True)

    class Meta:
        model  = Rental
        fields = [
            'id',
            'tool',
            'borrower',
            'start_date',
            'end_date',
            'total_price',
            'deposit_held',
            'status',
            'admin_note',
            'created_at',
            'updated_at',
        ]


# ─────────────────────────────────────────────
# Rental — Create
# ─────────────────────────────────────────────

class RentalCreateSerializer(serializers.Serializer):
    """
    Validates the body of POST /api/rentals/

    Business rules checked here:
    1. end_date must be after start_date (at least 1 day)
    2. Tool must exist
    3. No date overlap with existing active/pending/confirmed rentals (409)
    """
    tool_id    = serializers.IntegerField()
    start_date = serializers.DateField()
    end_date   = serializers.DateField()

    def validate(self, attrs):
        from tools.models import Tool
        import datetime

        tool_id    = attrs['tool_id']
        start_date = attrs['start_date']
        end_date   = attrs['end_date']

        # ۱. تاریخ پایان باید بعد از شروع باشد
        if end_date <= start_date:
            raise serializers.ValidationError(
                {'date_range': 'end_date must be after start_date.'}
            )

        # حداقل یک روز اجاره
        if (end_date - start_date).days < 1:
            raise serializers.ValidationError(
                {'date_range': 'Minimum rental duration is 1 day.'}
            )

        # ۲. ابزار باید وجود داشته باشد
        try:
            tool = Tool.objects.get(pk=tool_id)
        except Tool.DoesNotExist:
            raise serializers.ValidationError(
                {'tool_id': 'Tool not found.'}
            )

        # ۳. بررسی تداخل تاریخ با رزروهای فعال
        BLOCKING_STATUSES = ('pending', 'confirmed', 'active')
        conflict = Rental.objects.filter(
            tool_id=tool_id,
            status__in=BLOCKING_STATUSES,
        ).filter(
            # هر رزروی که با بازه درخواستی تداخل دارد
            start_date__lt=end_date,
            end_date__gt=start_date,
        ).exists()

        if conflict:
            raise serializers.ValidationError(
                {'date_conflict': 'این ابزار در تاریخ انتخابی رزرو است.'}
            )

        return attrs


# ─────────────────────────────────────────────
# Review — Create
# ─────────────────────────────────────────────

class ReviewCreateSerializer(serializers.Serializer):
    """
    Validates POST /api/rentals/<id>/review/

    Business rules:
    - Rental must have status = 'returned'
    - Reviewer cannot review themselves
    - reviewed_id must be the other party (owner or borrower)
    - Each (rental, reviewer) pair is unique
    """
    reviewed_id = serializers.IntegerField()
    rating      = serializers.IntegerField(min_value=1, max_value=5)
    comment     = serializers.CharField(required=False, allow_blank=True, default='')

    def validate(self, attrs):
        rental  = self.context['rental']
        request = self.context['request']
        user    = request.user

        # ۱. فقط بعد از returned می‌شود امتیاز داد
        if rental.status != 'returned':
            raise serializers.ValidationError(
                'Reviews can only be submitted after the rental is completed (returned).'
            )

        # ۲. نمی‌شود به خودت امتیاز داد
        if attrs['reviewed_id'] == user.id:
            raise serializers.ValidationError(
                'You cannot review yourself.'
            )

        # ۳. reviewed باید طرف مقابل باشد (صاحب ابزار یا قرض‌گیرنده)
        valid_reviewed_ids = {rental.borrower_id, rental.tool.owner_id}
        if attrs['reviewed_id'] not in valid_reviewed_ids:
            raise serializers.ValidationError(
                'You can only review the other party of this rental.'
            )

        # ۴. هر کاربر فقط یک بار می‌تواند برای این رزرو امتیاز دهد
        already_reviewed = Review.objects.filter(
            rental=rental,
            reviewer=user,
        ).exists()
        if already_reviewed:
            raise serializers.ValidationError(
                'You have already submitted a review for this rental.'
            )

        return attrs


# ─────────────────────────────────────────────
# Message
# ─────────────────────────────────────────────

class MessageSerializer(serializers.ModelSerializer):
    """
    Used in:
      GET  /api/rentals/<id>/messages/
      POST /api/rentals/<id>/messages/
    """
    sender = SimpleUserSerializer(read_only=True)

    class Meta:
        model  = Message
        fields = [
            'id',
            'sender',
            'content',
            'is_read',
            'created_at',
        ]
