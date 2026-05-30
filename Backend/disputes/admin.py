from django.contrib import admin
from .models import Dispute

@admin.register(Dispute)
class DisputeAdmin(admin.ModelAdmin):
    list_display = ['id', 'rental', 'raised_by', 'status', 'created_at']
    list_filter = ['status']
    readonly_fields = ['created_at']