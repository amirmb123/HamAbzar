"""
rentals/urls.py
---------------
URL patterns for the Rentals app.

Mounted at /api/rentals/ in config/urls.py

Full URL map:
  POST   /api/rentals/                    → create rental
  GET    /api/rentals/my/                 → my rentals as borrower
  GET    /api/rentals/my-tools/           → rentals of my tools (as owner)
  GET    /api/rentals/<id>/               → rental detail
  POST   /api/rentals/<id>/confirm/       → owner confirms pending rental
  POST   /api/rentals/<id>/handover/      → owner marks tool as handed over → active
  POST   /api/rentals/<id>/return/        → owner marks tool as returned → release funds
  POST   /api/rentals/<id>/cancel/        → borrower or owner cancels pending rental
  POST   /api/rentals/<id>/review/        → submit review after returned
  GET    /api/rentals/<id>/messages/      → list chat messages (polling)
  POST   /api/rentals/<id>/messages/      → send chat message
  POST   /api/rentals/<id>/dispute/       → raise a dispute for this rental
"""

from django.urls import path
from . import views

urlpatterns = [
    # ── Collection ───────────────────────────
    path(
        '',
        views.RentalCreateView.as_view(),
        name='rental-create',
    ),

    # ── My rentals (as borrower) ─────────────
    path(
        'my/',
        views.MyRentalsView.as_view(),
        name='my-rentals',
    ),

    # ── My tool rentals (as owner) ───────────
    path(
        'my-tools/',
        views.MyToolRentalsView.as_view(),
        name='my-tool-rentals',
    ),

    # ── Single rental detail ─────────────────
    path(
        '<int:rental_id>/',
        views.RentalDetailView.as_view(),
        name='rental-detail',
    ),

    # ── Status transitions ───────────────────
    path(
        '<int:rental_id>/confirm/',
        views.RentalConfirmView.as_view(),
        name='rental-confirm',
    ),
    path(
        '<int:rental_id>/handover/',
        views.RentalHandoverView.as_view(),
        name='rental-handover',
    ),
    path(
        '<int:rental_id>/return/',
        views.RentalReturnView.as_view(),
        name='rental-return',
    ),
    path(
        '<int:rental_id>/cancel/',
        views.RentalCancelView.as_view(),
        name='rental-cancel',
    ),

    # ── Review ───────────────────────────────
    path(
        '<int:rental_id>/review/',
        views.ReviewCreateView.as_view(),
        name='rental-review',
    ),

    # ── Chat messages ────────────────────────
    path(
        '<int:rental_id>/messages/',
        views.MessageListCreateView.as_view(),
        name='rental-messages',
    ),

    # ── Dispute (raises dispute, handled in disputes app) ───────────
    path(
        '<int:rental_id>/dispute/',
        views.RentalDisputeView.as_view(),
        name='rental-dispute',
    ),
]
