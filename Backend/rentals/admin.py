from django.contrib import admin
from .models import Rental, Transaction, Review

@admin.register(Rental)
class RentalAdmin(admin.ModelAdmin):
    list_display = ['id', 'tool', 'borrower', 'status', 'total_price', 'deposit_held', 'start_date', 'end_date']
    list_filter  = ['status']
    readonly_fields = ['created_at', 'updated_at']

admin.site.register(Transaction)
admin.site.register(Review)

# @admin.register(Transaction)
# class TransactionAdmin(admin.ModelAdmin):
#     list_display = ['id', 'rental', 'user', 'amount', 'type', 'created_at']
#     list_filter = ['type']
#     search_fields = ['rental__id', 'user__phone']

# @admin.register(Review)
# class ReviewAdmin(admin.ModelAdmin):
#     list_display = ['id', 'rental', 'reviewer', 'reviewed', 'rating', 'created_at']
#     list_filter = ['rating']
#     search_fields = ['rental__id', 'reviewer__phone']