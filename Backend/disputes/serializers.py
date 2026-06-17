from rest_framework import serializers
from .models import Dispute


class DisputeCreateSerializer(serializers.Serializer):
    """POST /api/rentals/<id>/dispute/"""
    reason = serializers.CharField(min_length=10, max_length=2000)


class DisputeResolveSerializer(serializers.Serializer):
    """PATCH /api/disputes/<id>/resolve/ — just admin"""
    resolution     = serializers.CharField(min_length=5, max_length=2000)
    penalty_amount = serializers.IntegerField(min_value=0, required=False, default=0)


class DisputeSerializer(serializers.ModelSerializer):
    """Full output of a dispute"""
    rental_id  = serializers.IntegerField(source='rental.id', read_only=True)
    raised_by  = serializers.SerializerMethodField()
    admin      = serializers.SerializerMethodField()

    class Meta:
        model  = Dispute
        fields = [
            'id',
            'rental_id',
            'raised_by',
            'reason',
            'status',
            'resolution',
            'penalty_amount',
            'admin',
            'resolved_at',
            'created_at',
        ]
        read_only_fields = fields

    def get_raised_by(self, obj):
        return {
            'id':        obj.raised_by.id,
            'full_name': obj.raised_by.full_name,
            'phone':     obj.raised_by.phone,
        }

    def get_admin(self, obj):
        if obj.admin:
            return {
                'id':        obj.admin.id,
                'full_name': obj.admin.full_name,
            }
        return None
