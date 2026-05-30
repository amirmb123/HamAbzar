from django.contrib import admin
from .models import User, OTPCode

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['phone', 'get_full_name', 'wallet_balance', 'rating', 'is_admin']
    search_fields = ['phone', 'full_name']
    list_filter = ['is_admin', 'is_active']
    readonly_fields = ['date_joined','rating', 'rating_count']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.phone
    get_full_name.short_description = 'full_name'
@admin.register(OTPCode)
class OTPCodeAdmin(admin.ModelAdmin):
    list_display = ['phone', 'code', 'is_used', 'expires_at']
    readonly_fields = ['created_at']