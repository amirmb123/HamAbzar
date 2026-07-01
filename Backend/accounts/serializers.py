from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User


class RequestOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=11)

    def validate_phone(self, value):
        if not value.isdigit() or len(value) != 11:
            raise serializers.ValidationError("شماره موبایل باید ۱۱ رقم باشد")
        if not value.startswith('09'):
            raise serializers.ValidationError("شماره موبایل باید با ۰۹ شروع شود")
        return value


class VerifyOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=11)
    code  = serializers.CharField(max_length=6)


class RegisterSerializer(serializers.Serializer):
    temp_token  = serializers.CharField(max_length=64)
    username    = serializers.CharField(max_length=150)
    password    = serializers.CharField(min_length=8, write_only=True)
    password2   = serializers.CharField(min_length=8, write_only=True)
    first_name  = serializers.CharField(max_length=150)
    last_name   = serializers.CharField(max_length=150)
    email       = serializers.EmailField(required=False, allow_blank=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("این نام کاربری قبلاً استفاده شده است")
        return value

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password2": "رمزهای عبور یکسان نیستند"})
        return data


class LoginPasswordSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        # authenticate expects USERNAME_FIELD — our User uses phone,
        # but login-by-username needs a custom check
        user = User.objects.filter(username=data['username']).first()
        if not user or not user.check_password(data['password']):
            raise serializers.ValidationError("نام کاربری یا رمز عبور اشتباه است")
        if not user.is_active:
            raise serializers.ValidationError("حساب کاربری غیرفعال است")
        data['user'] = user
        return data


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = ['id', 'phone', 'username', 'full_name', 'email', 'wallet_balance', 'rating', 'avatar','is_admin']
        read_only_fields = ['id', 'phone', 'wallet_balance', 'rating', 'is_admin']


    def get_full_name(self, obj):
        return obj.full_name


class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ['first_name', 'last_name', 'avatar', 'email']