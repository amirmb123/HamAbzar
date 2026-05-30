from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    phone          = models.CharField(max_length=11, unique=True)
    avatar         = models.ImageField(upload_to='avatars/', null=True, blank=True)
    wallet_balance = models.IntegerField(default=0)
    rating         = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    rating_count   = models.IntegerField(default=0)
    is_active      = models.BooleanField(default=True)
    is_admin       = models.BooleanField(default=False)

    # login with phone not username
    USERNAME_FIELD  = 'phone'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.phone


class OTPCode(models.Model):
    phone      = models.CharField(max_length=11)
    code       = models.CharField(max_length=6)
    is_used    = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.phone} - {self.code}"