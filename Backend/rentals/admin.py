from django.contrib import admin
from .models import Rental, Transaction, Review


@admin.register(Rental)
class RentalAdmin(admin.ModelAdmin):
    list_display  = ['id', 'tool', 'borrower', 'status', 'total_price', 'deposit_held', 'start_date', 'end_date', 'created_at']
    list_filter   = ['status']
    search_fields = ['tool__name', 'borrower__phone']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display  = ['id', 'rental', 'type', 'amount', 'from_user', 'to_user', 'created_at']
    list_filter   = ['type']
    search_fields = ['rental__id', 'from_user__phone', 'to_user__phone']
    readonly_fields = ['created_at']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display  = ['id', 'rental', 'reviewer', 'reviewed', 'rating', 'created_at']
    list_filter   = ['rating']
    search_fields = ['rental__id', 'reviewer__phone', 'reviewed__phone']
    readonly_fields = ['created_at']