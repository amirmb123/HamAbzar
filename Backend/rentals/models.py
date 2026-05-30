from django.db import models
from accounts.models import User
from tools.models import Tool
from django.core.validators import MinValueValidator, MaxValueValidator


class Rental(models.Model):
    STATUS_CHOICES = [
        ('pending',   'Pending'),
        ('confirmed', 'Confirmed'),
        ('active',    'Active'),
        ('returned',  'Returned'),
        ('disputed',  'Disputed'),
        ('cancelled', 'Cancelled'),
    ]

    tool         = models.ForeignKey(Tool, on_delete=models.PROTECT, related_name='rentals')
    borrower     = models.ForeignKey(User, on_delete=models.PROTECT, related_name='rentals')
    start_date   = models.DateField()
    end_date     = models.DateField()
    total_price  = models.PositiveIntegerField ()
    deposit_held = models.PositiveIntegerField (default=0)
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_note   = models.TextField(blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)


    def __str__(self):
        return f"Rental #{self.id} - {self.tool.name}"


class Transaction(models.Model):
    TYPE_CHOICES = [
        ('rental_payment',  'Rental Payment'),
        ('deposit_hold',    'Deposit Hold'),
        ('deposit_return',  'Deposit Return'),
        ('deposit_penalty', 'Deposit Penalty'),
    ]

    rental     = models.ForeignKey(Rental, on_delete=models.PROTECT, related_name='transactions')
    user       = models.ForeignKey(User, on_delete=models.PROTECT, related_name='transactions')
    amount     = models.IntegerField()
    type       = models.CharField(max_length=20, choices=TYPE_CHOICES)
    note       = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} - {self.amount}"


class Review(models.Model):
    rental      = models.ForeignKey(Rental, on_delete=models.PROTECT, related_name='reviews')
    reviewer    = models.ForeignKey(User, on_delete=models.CASCADE, related_name='given_reviews')
    reviewed    = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_reviews')
    rating = models.SmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment     = models.TextField(blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['rental', 'reviewer']