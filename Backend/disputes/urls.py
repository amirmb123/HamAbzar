from django.urls import path
from . import views

urlpatterns = [
    # GET  /api/disputes/               — لیست همه شکایت‌ها (ادمین)
    path('', views.DisputeListView.as_view(), name='dispute-list'),

    # ── Admin: resolve a dispute ──────────────
    path(
        '<int:dispute_id>/resolve/',
        views.DisputeResolveView.as_view(),
        name='dispute-resolve',
    ),
]
