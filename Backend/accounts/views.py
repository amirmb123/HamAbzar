import random
from datetime import timedelta
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, OTPCode
from .serializers import RequestOTPSerializer, VerifyOTPSerializer, UserSerializer, UpdateProfileSerializer


def get_tokens_for_user(user):
    """Helper to create access and refresh tokens for a user"""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access':  str(refresh.access_token),
    }


class RequestOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RequestOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'status': 'error', 'message': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        phone = serializer.validated_data['phone']

        # Generate a 6-digit code
        code = str(random.randint(100000, 999999))
        expires_at = timezone.now() + timedelta(minutes=5)

        # Save in database
        OTPCode.objects.create(phone=phone, code=code, expires_at=expires_at)

        # Print only in development environment
        print(f"\n{'='*30}")
        print(f"OTP for {phone}: {code}")
        print(f"{'='*30}\n")

        return Response({'status': 'success', 'message': 'Code sent'})


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'status': 'error', 'message': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        phone = serializer.validated_data['phone']
        code  = serializer.validated_data['code']

        # Find a valid code
        otp = OTPCode.objects.filter(
            phone=phone,
            code=code,
            is_used=False,
            expires_at__gt=timezone.now()
        ).last()

        if not otp:
            return Response(
                {'status': 'error', 'message': 'Code is incorrect or expired'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Mark the code as used
        otp.is_used = True
        otp.save()

        # Find or create the user
        user, created = User.objects.get_or_create(
            phone=phone,
            defaults={'username': phone}
        )

        tokens = get_tokens_for_user(user)

        return Response({
            'status': 'success',
            'data': {
                'access':  tokens['access'],
                'refresh': tokens['refresh'],
                'user': UserSerializer(user).data
            }
        })


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'status': 'success',
            'data': UserSerializer(request.user).data
        })

    def patch(self, request):
        serializer = UpdateProfileSerializer(
            request.user,
            data=request.data,
            partial=True      
        )
        if not serializer.is_valid():
            return Response(
                {'status': 'error', 'message': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer.save()
        return Response({
            'status': 'success',
            'data': UserSerializer(request.user).data
        })