"""
config/urls.py
--------------
Root URL configuration for the HamAbzar project.

API structure:
  /api/auth/           → accounts (OTP login, JWT, me, profile)
  /api/tools/          → tools CRUD + geo-search + availability + images
  /api/categories/     → reference: tool categories
  /api/cities/         → reference: cities
  /api/rentals/        → rental lifecycle + chat + reviews + disputes
  /api/disputes/       → admin dispute management
  /api/users/          → public user profiles + reviews
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from tools.urls import reference_urlpatterns
from accounts.urls import user_urlpatterns

urlpatterns = [
    # ── Django admin ──────────────────────────────────────
    path('admin/', admin.site.urls),

    # ── Auth (OTP login, JWT refresh, me, update profile) ─
    path('api/auth/', include('accounts.urls')),

    # ── Tools (CRUD + geo + availability + images) ─────────
    path('api/tools/', include('tools.urls')),

    # ── Reference data (categories, cities) ───────────────
    # These live in tools/urls.py as reference_urlpatterns
    # but are mounted at /api/ level for clean URLs
    path('api/', include(reference_urlpatterns)),

    # ── Rentals (create, transitions, review, chat, dispute)
    path('api/rentals/', include('rentals.urls')),

    # ── Disputes (admin: list + resolve) ──────────────────
    path('api/disputes/', include('disputes.urls')),

    # ── Public user profiles ───────────────────────────────
    path('api/users/', include(user_urlpatterns)),
]

# ── Serve media files in development ──────────────────────
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
