from django.db import models
from accounts.models import User
from rentals.models import Rental


class Dispute(models.Model):
    STATUS_CHOICES = [
        ('open',         'Open'),
        ('under_review', 'Under Review'),
        ('resolved',     'Resolved'),
    ]

    rental         = models.OneToOneField(Rental, on_delete=models.CASCADE, related_name='dispute')
    raised_by      = models.ForeignKey(User, on_delete=models.PROTECT, related_name='raised_disputes')
    reason         = models.TextField()
    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    admin          = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='resolved_disputes',
    )
    resolution     = models.TextField(blank=True)
    penalty_amount = models.PositiveIntegerField(default=0)
    resolved_at    = models.DateTimeField(null=True, blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Dispute for Rental #{self.rental.id}"
