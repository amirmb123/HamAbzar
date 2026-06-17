<<<<<<< HEAD
=======
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
>>>>>>> 71170af0c541d91e9e12860b8053a09839c6b858
from django.urls import path

urlpatterns = [
<<<<<<< HEAD
    # GET  /api/disputes/               — لیست همه شکایت‌ها (ادمین)
    path('', views.DisputeListView.as_view(), name='dispute-list'),

    # ── Admin: resolve a dispute ──────────────
    path(
        '<int:dispute_id>/resolve/',
        views.DisputeResolveView.as_view(),
        name='dispute-resolve',
    ),
=======
    # path('admin/', admin.site.urls),
>>>>>>> 71170af0c541d91e9e12860b8053a09839c6b858
]
