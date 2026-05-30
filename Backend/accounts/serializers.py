from rest_framework import serializers
from .models import User


class RequestOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=11)

    def validate_phone(self, value):
        if not value.isdigit() or len(value) != 11:
            raise serializers.ValidationError("Phone number must be 11 digits")
        if not value.startswith('09'):
            raise serializers.ValidationError("Phone number must start with 09")
        return value


class VerifyOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=11)
    code  = serializers.CharField(max_length=6)


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = ['id', 'phone', 'full_name', 'wallet_balance', 'rating', 'avatar']
        read_only_fields = ['id', 'wallet_balance', 'rating']
    
    def get_full_name(self, obj):
        return obj.full_name
    


class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ['first_name', 'last_name', 'avatar']