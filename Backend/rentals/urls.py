from django.urls import path
from . import views

urlpatterns = [
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