from django.urls import path
from . import views

urlpatterns = [
    # GET  /api/disputes/               — لیست همه شکایت‌ها (ادمین)
    path('', views.DisputeListView.as_view(), name='dispute-list'),

<<<<<<< HEAD
    # PATCH /api/disputes/<id>/resolve/ — حل شکایت (ادمین)
    path('<int:dispute_id>/resolve/', views.DisputeResolveView.as_view(), name='dispute-resolve'),
=======
    # ── Admin: resolve a dispute ──────────────
    path(
        '<int:dispute_id>/resolve/',
        views.DisputeResolveView.as_view(),
        name='dispute-resolve',
    ),
>>>>>>> 5a61c4597c1e77120ed305aa872362205deeb194
]
