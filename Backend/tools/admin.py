from django.contrib import admin
from .models import Category, City, Tool, ToolImage

admin.site.register(Category)
admin.site.register(City)

@admin.register(Tool)
class ToolAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'category', 'daily_price', 'is_available']
    list_filter  = ['category', 'city', 'is_available']
    search_fields = ['name', 'owner__phone', 'owner__full_name']