"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # OTP flow
    path('request-otp/', views.RequestOTPView.as_view(),   name='request-otp'),
    path('verify-otp/',  views.VerifyOTPView.as_view(),    name='verify-otp'),

    # Registration (after OTP verification)
    path('register/',    views.RegisterView.as_view(),     name='register'),

    # Login with username/password
    path('login/',       views.LoginPasswordView.as_view(), name='login-password'),

    # Token
    path('refresh/',     TokenRefreshView.as_view(),        name='token-refresh'),

    # Profile
    path('me/',          views.MeView.as_view(),            name='me'),
]