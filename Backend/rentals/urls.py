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
from django.contrib import admin
from django.urls import path
from disputes.views import DisputeCreateView

urlpatterns = [
    path('admin/', admin.site.urls),
    # ── Dispute ──────────────────────────────
    path('<int:rental_id>/dispute/', DisputeCreateView.as_view(), name='dispute-create'),
    # ── Collection ───────────────────────────
    path('',              views.RentalCreateView.as_view(),    name='rental-create'),
    path('my/',           views.MyRentalsView.as_view(),       name='my-rentals'),
    path('my-tools/',     views.MyToolRentalsView.as_view(),   name='my-tool-rentals'),

    # ── Single rental ────────────────────────
    path('<int:rental_id>/',          views.RentalDetailView.as_view(),   name='rental-detail'),
    path('<int:rental_id>/confirm/',  views.RentalConfirmView.as_view(),  name='rental-confirm'),
    path('<int:rental_id>/handover/', views.RentalHandoverView.as_view(), name='rental-handover'),
    path('<int:rental_id>/return/',   views.RentalReturnView.as_view(),   name='rental-return'),
    path('<int:rental_id>/cancel/',   views.RentalCancelView.as_view(),   name='rental-cancel'),

    # ── Review ───────────────────────────────
    path('<int:rental_id>/review/',   views.ReviewCreateView.as_view(),   name='rental-review'),

    # ── Chat ─────────────────────────────────
    path('<int:rental_id>/messages/', views.MessageListCreateView.as_view(), name='rental-messages'),
]
