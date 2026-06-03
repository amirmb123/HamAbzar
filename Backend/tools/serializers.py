"""
tools/serializers.py
--------------------
Serializers for Category, City, Tool, and ToolImage.
 
Design notes:
- OwnerSerializer  : read-only nested object shown inside ToolListSerializer
- CategorySerializer / CitySerializer: lightweight, used for dropdowns
- ToolImageSerializer : single image row
- ToolListSerializer  : compact view used in the paginated list endpoint
                        includes distance_km (injected by the view via context)
- ToolDetailSerializer: full view with image gallery, used in retrieve endpoint
- ToolWriteSerializer : used for create / partial_update; validates coordinates
"""

from rest_framework import serializers
from .models import Category, City, Tool, ToolImage


# ─────────────────────────────────────────────
# Lookup / reference serializers
# ─────────────────────────────────────────────

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Category
        fields = ['id', 'name']


class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model  = City
        fields = ['id', 'name']


# ─────────────────────────────────────────────
# Nested: owner info shown inside tool cards
# ─────────────────────────────────────────────

class OwnerSerializer(serializers.Serializer):
    """
    Read-only snapshot of a user shown inside tool responses.
    We don't import UserSerializer from accounts to avoid circular imports.
    """
    id        = serializers.IntegerField()
    full_name = serializers.CharField()
    rating    = serializers.DecimalField(max_digits=3, decimal_places=1)
    avatar    = serializers.ImageField(allow_null=True)


# ─────────────────────────────────────────────
# Tool Image
# ─────────────────────────────────────────────

class ToolImageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ToolImage
        fields = ['id', 'image', 'is_primary']


# ─────────────────────────────────────────────
# Tool — List (compact, for cards on the map/list page)
# ─────────────────────────────────────────────

class ToolListSerializer(serializers.ModelSerializer):
    """
    Compact representation used in paginated list results.
    `distance_km` is NOT a model field; it is injected by the view
    through serializer context after Haversine calculation.
    """
    category     = CategorySerializer(read_only=True)
    city         = CitySerializer(read_only=True)
    owner        = OwnerSerializer(read_only=True)
    thumbnail    = serializers.SerializerMethodField()
    distance_km  = serializers.SerializerMethodField()

    class Meta:
        model  = Tool
        fields = [
            'id', 'name',
            'category', 'city',
            'daily_price', 'deposit_amount',
            'is_available',
            'owner',
            'thumbnail',
            'distance_km',
            'rating',
        ]

    def get_thumbnail(self, obj):
        """Return the URL of the primary image, or the first one, or None."""
        primary = obj.images.filter(is_primary=True).first()
        image   = primary or obj.images.first()
        if image and image.image:
            request = self.context.get('request')
            return request.build_absolute_uri(image.image.url) if request else image.image.url
        return None

    def get_distance_km(self, obj):
        """
        Distance is pre-computed by the view and stored in context
        as a dict  {tool_id: distance_km}.
        Falls back to None when the caller didn't supply coordinates.
        """
        distances = self.context.get('distances', {})
        return distances.get(obj.id)


# ─────────────────────────────────────────────
# Tool — Detail (full, for the detail page)
# ─────────────────────────────────────────────

class ToolDetailSerializer(serializers.ModelSerializer):
    """
    Full representation returned by the retrieve endpoint.
    Includes the complete image gallery and owner details.
    Note: latitude / longitude are intentionally omitted to protect
    the owner's exact address (only approximate location is exposed).
    """
    category = CategorySerializer(read_only=True)
    city     = CitySerializer(read_only=True)
    owner    = OwnerSerializer(read_only=True)
    images   = ToolImageSerializer(many=True, read_only=True)

    class Meta:
        model  = Tool
        fields = [
            'id', 'name', 'description',
            'category', 'city',
            'daily_price', 'deposit_amount',
            'is_available',
            'owner',
            'images',
            'rating',
            'created_at',
        ]


# ─────────────────────────────────────────────
# Tool — Write (create / partial update)
# ─────────────────────────────────────────────

class ToolWriteSerializer(serializers.ModelSerializer):
    """
    Used for POST (create) and PATCH (partial update).
    The owner is set automatically from request.user in the view,
    so it is excluded from the writable fields.

    Coordinate validation:
      - latitude  must be in [-90, 90]
      - longitude must be in [-180, 180]
    """

    class Meta:
        model  = Tool
        fields = [
            'name', 'description',
            'category', 'city',
            'daily_price', 'deposit_amount',
            'latitude', 'longitude',
        ]

    def validate_latitude(self, value):
        if not (-90 <= value <= 90):
            raise serializers.ValidationError(
                "Latitude must be between -90 and 90."
            )
        return value

    def validate_longitude(self, value):
        if not (-180 <= value <= 180):
            raise serializers.ValidationError(
                "Longitude must be between -180 and 180."
            )
        return value

    def validate_daily_price(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Daily price must be a positive number."
            )
        return value

    def validate_deposit_amount(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Deposit amount cannot be negative."
            )
        return value


# ─────────────────────────────────────────────
# Tool Image Upload
# ─────────────────────────────────────────────

class ToolImageUploadSerializer(serializers.ModelSerializer):
    """
    Accepts a single image file upload.
    The tool FK is set by the view, not by the client.
    """
    class Meta:
        model  = ToolImage
        fields = ['id', 'image', 'is_primary']

    def validate(self, attrs):
        tool = self.context.get('tool')
        if tool and tool.images.count() >= 5:
            raise serializers.ValidationError(
                "A tool can have at most 5 images."
            )
        return attrs


# ─────────────────────────────────────────────
# Availability
# ─────────────────────────────────────────────

class AvailabilitySerializer(serializers.Serializer):
    """
    Simple response shape for the availability endpoint.
    booked_dates is a list of ISO date strings.
    """
    booked_dates = serializers.ListField(
        child=serializers.DateField()
    )