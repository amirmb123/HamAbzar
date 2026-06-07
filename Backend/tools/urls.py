"""
tools/urls.py
-------------
URL patterns for the Tools app.

Mounted at /api/tools/ in config/urls.py (already done).
Two reference endpoints (categories / cities) are also registered here
because they are tightly coupled to tool filtering.

Full URL map:
  GET    /api/tools/                       → list + geo-search
  POST   /api/tools/                       → create tool
  GET    /api/tools/<id>/                  → tool detail
  PATCH  /api/tools/<id>/                  → update tool (owner only)
  DELETE /api/tools/<id>/                  → delete tool (owner only)
  GET    /api/tools/<id>/availability/     → booked dates for a month
  POST   /api/tools/<id>/images/           → upload image (owner only)
  GET    /api/categories/                  → dropdown data
  GET    /api/cities/                      → dropdown data
"""

from django.urls import path
from . import views

urlpatterns = [
    # ── Tool collection ──────────────────────
    path(
        '',
        views.ToolListCreateView.as_view(),
        name='tool-list-create',
    ),

    # ── Tool item ────────────────────────────
    path(
        '<int:tool_id>/',
        views.ToolDetailView.as_view(),
        name='tool-detail',
    ),

    # ── Availability calendar ─────────────────
    path(
        '<int:tool_id>/availability/',
        views.ToolAvailabilityView.as_view(),
        name='tool-availability',
    ),

    # ── Image upload ──────────────────────────
    path(
        '<int:tool_id>/images/',
        views.ToolImageUploadView.as_view(),
        name='tool-image-upload',
    ),
]

# ── Reference data (needed for filters / dropdowns) ──────────────────────────
# These could also live in a separate `lookups` app but belong here
# because tools is the only consumer.
reference_urlpatterns = [
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('cities/',     views.CityListView.as_view(),     name='city-list'),
]