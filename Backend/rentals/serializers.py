"""
rentals/serializers.py
----------------------
Serializers for Rental, Review, and Message models.

Merged best-of-both version:
- RentalListSerializer  : compact view for list endpoints
- RentalDetailSerializer: full view WITH owner field (from incoming)
- RentalCreateSerializer: validates dates including past-date check (from incoming)
                          + correct overlap logic (from current)
- ReviewCreateSerializer: full security — self-review + party check + duplicate (from incoming)
- MessageSerializer     : full sender object with avatar (from current)
"""

from rest_framework import serializers
from django.utils import timezone
from .models import Rental, Review
from chat.models import Message


# ─────────────────────────────────────────────
# Nested helpers
# ─────────────────────────────────────────────

class SimpleToolSerializer(serializers.Serializer):
    id             = serializers.IntegerField()
    name           = serializers.CharField()
    daily_price    = serializers.IntegerField()
    deposit_amount = serializers.IntegerField()


class SimpleUserSerializer(serializers.Serializer):
    id        = serializers.IntegerField()
    full_name = serializers.CharField()
    phone     = serializers.CharField()
    rating    = serializers.DecimalField(max_digits=3, decimal_places=1)
    avatar    = serializers.ImageField(allow_null=True)   # ✅ از current


# ─────────────────────────────────────────────
# Rental — List
# ─────────────────────────────────────────────

class RentalListSerializer(serializers.ModelSerializer):
    tool     = SimpleToolSerializer(read_only=True)
    borrower = SimpleUserSerializer(read_only=True)

    class Meta:
        model  = Rental
        fields = [
            'id', 'tool', 'borrower',
            'start_date', 'end_date',
            'total_price', 'deposit_held',
            'status', 'created_at',
        ]


# ─────────────────────────────────────────────
# Rental — Detail
# ─────────────────────────────────────────────

class RentalDetailSerializer(serializers.ModelSerializer):
    tool     = SimpleToolSerializer(read_only=True)
    borrower = SimpleUserSerializer(read_only=True)
    owner    = serializers.SerializerMethodField()   # ✅ از incoming

    class Meta:
        model  = Rental
        fields = [
            'id', 'tool', 'borrower', 'owner',      # ✅ owner اضافه شد
            'start_date', 'end_date',
            'total_price', 'deposit_held',
            'status', 'admin_note',
            'created_at', 'updated_at',
        ]

    def get_owner(self, obj):
        return SimpleUserSerializer(obj.tool.owner).data


# ─────────────────────────────────────────────
# Rental — Create
# ─────────────────────────────────────────────

class RentalCreateSerializer(serializers.Serializer):
    tool_id    = serializers.IntegerField()
    start_date = serializers.DateField()
    end_date   = serializers.DateField()

    def validate_tool_id(self, value):
        from tools.models import Tool
        try:
            tool = Tool.objects.get(pk=value)
        except Tool.DoesNotExist:
            raise serializers.ValidationError("Tool not found.")
        if not tool.is_available:
            raise serializers.ValidationError("This tool is not available for rent.")
        return value

    def validate(self, attrs):
        start   = attrs['start_date']
        end     = attrs['end_date']
        today   = timezone.now().date()
        tool_id = attrs['tool_id']

        # ✅ از incoming — بررسی تاریخ گذشته
        if start < today:
            raise serializers.ValidationError(
                {"start_date": "Start date cannot be in the past."}
            )

        # تاریخ پایان باید بعد از شروع باشد
        if end <= start:
            raise serializers.ValidationError(
                {"end_date": "End date must be after start date."}
            )

        # ✅ از current — منطق تداخل صحیح (strict overlap)
        conflict = Rental.objects.filter(
            tool_id=tool_id,
            status__in=['pending', 'confirmed', 'active'],
            start_date__lt=end,
            end_date__gt=start,
        ).exists()
        if conflict:
            raise serializers.ValidationError(
                {"date_conflict": "این ابزار در تاریخ انتخابی رزرو است."}
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

        # ۱. فقط بعد از returned
        if rental.status != 'returned':
            raise serializers.ValidationError(
                "Reviews can only be submitted after the tool is returned."
            )

        # ✅ از incoming — تعیین طرف مقابل بر اساس نقش
        is_borrower = user.id == rental.borrower_id
        is_owner    = user.id == rental.tool.owner_id

        if is_borrower:
            expected_reviewed_id = rental.tool.owner_id
        elif is_owner:
            expected_reviewed_id = rental.borrower_id
        else:
            raise serializers.ValidationError("Access denied.")

        # ✅ از incoming — باید دقیقاً طرف مقابل باشد
        if attrs['reviewed_id'] != expected_reviewed_id:
            raise serializers.ValidationError(
                "You can only review the other party of this rental."
            )

        # ۲. نمیشه به خودت امتیاز داد (لایه دفاعی اضافه)
        if attrs['reviewed_id'] == user.id:
            raise serializers.ValidationError("You cannot review yourself.")

        # ۳. امتیاز تکراری
        if Review.objects.filter(rental=rental, reviewer=user).exists():
            raise serializers.ValidationError(
                "You have already submitted a review for this rental."
            )

        return attrs


# ─────────────────────────────────────────────
# Message
# ─────────────────────────────────────────────

class MessageSerializer(serializers.ModelSerializer):
    sender = SimpleUserSerializer(read_only=True)   # ✅ از current — کامل‌تر از sender_name

    class Meta:
        model  = Message
        fields = ['id', 'sender', 'content', 'is_read', 'created_at']
        read_only_fields = ['id', 'sender', 'is_read', 'created_at']