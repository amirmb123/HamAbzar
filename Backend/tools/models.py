from django.db import models
from accounts.models import User


class Category(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class City(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Tool(models.Model):
    owner          = models.ForeignKey(User, on_delete=models.PROTECT, related_name='tools')
    category       = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='tools')
    city           = models.ForeignKey(City, on_delete=models.PROTECT, related_name='tools')
    name           = models.CharField(max_length=200)
    description    = models.TextField(blank=True)
    daily_price    = models.PositiveIntegerField()
    deposit_amount = models.IntegerField(default=0)
    latitude       = models.DecimalField(max_digits=9, decimal_places=6)
    longitude      = models.DecimalField(max_digits=9, decimal_places=6)
    is_available   = models.BooleanField(default=True)
    created_at     = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"{self.name} - {self.owner.phone}"


class ToolImage(models.Model):
    tool       = models.ForeignKey(Tool, on_delete=models.CASCADE, related_name='images')
    image      = models.ImageField(upload_to='tools/')
    sort_order = models.IntegerField(default=0)
    is_primary = models.BooleanField(default=False)

    class Meta:
        ordering = ['sort_order']