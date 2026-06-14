"""
disputes/urls.py
----------------
URL patterns for the Disputes app.

Mounted at /api/disputes/ in config/urls.py

Full URL map:
  GET   /api/disputes/              → list all disputes (admin only)
  PATCH /api/disputes/<id>/resolve/ → resolve dispute + financial ruling (admin only)
"""

from django.urls import path
from . import views

urlpatterns = [
    # ── Admin: list all disputes ──────────────
    path(
        '',
        views.DisputeListView.as_view(),
        name='dispute-list',
    ),

    # ── Admin: resolve a dispute ──────────────
    path(
        '<int:dispute_id>/resolve/',
        views.DisputeResolveView.as_view(),
        name='dispute-resolve',
    ),
]