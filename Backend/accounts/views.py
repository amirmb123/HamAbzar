import secrets
from datetime import timedelta
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, OTPCode
from .serializers import (
    RequestOTPSerializer,
    VerifyOTPSerializer,
    RegisterSerializer,
    LoginPasswordSerializer,
    UserSerializer,
    UpdateProfileSerializer,
)

OTP_EXPIRY_MINUTES        = 2
OTP_RATE_LIMIT_MINUTES    = 2
TEMP_TOKEN_EXPIRY_MINUTES = 15


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access':  str(refresh.access_token),
    }


class RequestOTPView(APIView):
    """
    Step 1 — Send OTP
    POST { phone }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RequestOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'status': 'error', 'message': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        phone = serializer.validated_data['phone']

        # rate limit: prevent repeated requests
        recent = OTPCode.objects.filter(
            phone=phone,
            created_at__gt=timezone.now() - timedelta(minutes=OTP_RATE_LIMIT_MINUTES)
        ).exists()
        if recent:
            return Response(
                {'status': 'error', 'message': f'لطفاً {OTP_RATE_LIMIT_MINUTES} دقیقه صبر کنید'},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        code       = str(secrets.randbelow(900000) + 100000)
        expires_at = timezone.now() + timedelta(minutes=OTP_EXPIRY_MINUTES)
        OTPCode.objects.create(phone=phone, code=code, expires_at=expires_at)

        # only in development environment
        print(f"\n{'='*30}\nOTP for {phone}: {code}\n{'='*30}\n")

        return Response({'status': 'success', 'message': 'کد ارسال شد'})


class VerifyOTPView(APIView):
    """
    Step 2 — Verify OTP
    POST { phone, code }

    If user already registered → direct login (JWT)
    If user is new → temp_token for completing registration
    """
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

        otp = OTPCode.objects.filter(
            phone=phone,
            code=code,
            is_used=False,
            expires_at__gt=timezone.now()
        ).last()

        if not otp:
            return Response(
                {'status': 'error', 'message': 'کد اشتباه یا منقضی شده است'},
                status=status.HTTP_400_BAD_REQUEST
            )

        otp.is_used = True

        user = User.objects.filter(phone=phone).first()

        if user:
            # user exists → direct login
            otp.save()
            tokens = get_tokens_for_user(user)
            return Response({
                'status': 'success',
                'next':   'login',
                'data': {
                    'access':  tokens['access'],
                    'refresh': tokens['refresh'],
                    'user':    UserSerializer(user).data,
                }
            })
        else:
            # new user → temp_token for next step
            token                 = secrets.token_hex(32)
            otp.temp_token        = token
            otp.token_expires_at  = timezone.now() + timedelta(minutes=TEMP_TOKEN_EXPIRY_MINUTES)
            otp.save()
            return Response({
                'status': 'success',
                'next':   'register',
                'data': {
                    'temp_token': token,
                    'phone':      phone,
                }
            })


class RegisterView(APIView):
    """
    Step 3 — Complete registration (only for new users)
    POST { temp_token, username, password, password2, first_name, last_name, email? }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'status': 'error', 'message': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        data = serializer.validated_data

        # validate temp_token
        otp = OTPCode.objects.filter(
            temp_token=data['temp_token'],
            is_used=True,
            token_expires_at__gt=timezone.now()
        ).last()

        if not otp:
            return Response(
                {'status': 'error', 'message': 'توکن نامعتبر یا منقضی شده است'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # prevent re‑registration with the same token
        if User.objects.filter(phone=otp.phone).exists():
            return Response(
                {'status': 'error', 'message': 'این شماره قبلاً ثبت‌نام کرده است'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.create_user(
            phone      = otp.phone,
            username   = data['username'],
            password   = data['password'],
            first_name = data['first_name'],
            last_name  = data['last_name'],
            email      = data.get('email', ''),
        )

        # invalidate token to prevent reuse
        otp.temp_token       = None
        otp.token_expires_at = None
        otp.save()

        tokens = get_tokens_for_user(user)
        return Response({
            'status': 'success',
            'data': {
                'access':  tokens['access'],
                'refresh': tokens['refresh'],
                'user':    UserSerializer(user).data,
            }
        }, status=status.HTTP_201_CREATED)


class LoginPasswordView(APIView):
    """
    Login with username and password
    POST { username, password }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'status': 'error', 'message': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        user   = serializer.validated_data['user']
        tokens = get_tokens_for_user(user)
        return Response({
            'status': 'success',
            'data': {
                'access':  tokens['access'],
                'refresh': tokens['refresh'],
                'user':    UserSerializer(user).data,
            }
        })


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'status': 'success',
            'data':   UserSerializer(request.user).data
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
            'data':   UserSerializer(request.user).data
        })