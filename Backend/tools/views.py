"""
tools/views.py
--------------
All views for the Tools app.  Responsible for:
  - GET  /api/tools/              → paginated list with optional geo-filter
  - POST /api/tools/              → create a new tool listing (auth required)
  - GET  /api/tools/<id>/         → full detail of a single tool
  - PATCH /api/tools/<id>/        → partial update (owner only)
  - DELETE /api/tools/<id>/       → delete (owner only)
  - GET  /api/tools/<id>/availability/?month=YYYY-MM  → booked date ranges
  - POST /api/tools/<id>/images/  → upload up to 5 images (owner only)
  - GET  /api/categories/         → reference list
  - GET  /api/cities/             → reference list

Haversine formula
-----------------
Straight-line distance between two (lat, lng) pairs on Earth's surface.
Used to sort and optionally filter tools by proximity when the client
sends `lat`, `lng`, and an optional `radius` (default 10 km).
"""

import math
import calendar
from datetime import date

from rest_framework.views    import APIView
from rest_framework.response import Response
from rest_framework          import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser

from .models      import Category, City, Tool, ToolImage
from .serializers import (
    CategorySerializer,
    CitySerializer,
    ToolListSerializer,
    ToolDetailSerializer,
    ToolWriteSerializer,
    ToolImageUploadSerializer,
    AvailabilitySerializer,
)


# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────

EARTH_RADIUS_KM = 6371.0


def haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Return the great-circle distance in kilometres between two points.
    All angles are in decimal degrees.
    """
    phi1, phi2     = math.radians(lat1), math.radians(lat2)
    d_phi          = math.radians(lat2 - lat1)
    d_lambda       = math.radians(lng2 - lng1)

    a = (
        math.sin(d_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    )
    return EARTH_RADIUS_KM * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def is_owner(user, tool) -> bool:
    """Return True when the requesting user owns the tool."""
    return tool.owner_id == user.id


# ─────────────────────────────────────────────
# Tool List + Create
# ─────────────────────────────────────────────

class ToolListCreateView(APIView):
    """
    GET  /api/tools/   → public, paginated, filterable
    POST /api/tools/   → authenticated owners only
    """

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    # ── GET ──────────────────────────────────

    def get(self, request):
        qs = Tool.objects.select_related('owner', 'category', 'city') \
                         .prefetch_related('images') \
                         .filter(is_available=True)

        # ── Optional filters ──────────────────
        category_id = request.query_params.get('category')
        city_id     = request.query_params.get('city')
        price_max   = request.query_params.get('price_max')

        if category_id:
            qs = qs.filter(category_id=category_id)
        if city_id:
            qs = qs.filter(city_id=city_id)
        if price_max:
            try:
                qs = qs.filter(daily_price__lte=int(price_max))
            except ValueError:
                return Response(
                    {'status': 'error', 'message': 'price_max must be an integer'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # ── Geo filter (Haversine) ────────────
        lat_raw    = request.query_params.get('lat')
        lng_raw    = request.query_params.get('lng')
        radius_raw = request.query_params.get('radius', '10')

        distances  = {}          # {tool_id: distance_km}

        if lat_raw and lng_raw:
            try:
                user_lat = float(lat_raw)
                user_lng = float(lng_raw)
                radius   = float(radius_raw)
            except ValueError:
                return Response(
                    {'status': 'error', 'message': 'lat, lng, and radius must be numbers'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Python-level distance filter
            # (For large datasets use PostGIS or bounding-box pre-filter)
            filtered = []
            for tool in qs:
                if tool.latitude is None or tool.longitude is None:
                    continue
                d = haversine(user_lat, user_lng, tool.latitude, tool.longitude)
                if d <= radius:
                    distances[tool.id] = round(d, 2)
                    filtered.append(tool)

            # Sort nearest-first
            filtered.sort(key=lambda t: distances[t.id])
            qs = filtered          # now a plain list, not a queryset

        # ── Pagination ────────────────────────
        # Use DRF's built-in paginator from settings (PAGE_SIZE = 20)
        from rest_framework.pagination import PageNumberPagination
        paginator = PageNumberPagination()
        page      = paginator.paginate_queryset(qs, request)

        serializer = ToolListSerializer(
            page,
            many=True,
            context={'request': request, 'distances': distances},
        )
        return paginator.get_paginated_response(serializer.data)

    # ── POST ─────────────────────────────────

    def post(self, request):
        serializer = ToolWriteSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'status': 'error', 'message': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        tool = serializer.save(owner=request.user)
        return Response(
            {
                'status': 'success',
                'data'  : ToolDetailSerializer(tool, context={'request': request}).data,
            },
            status=status.HTTP_201_CREATED,
        )


# ─────────────────────────────────────────────
# Tool Detail + Update + Delete
# ─────────────────────────────────────────────

class ToolDetailView(APIView):
    """
    GET    /api/tools/<id>/  → public
    PATCH  /api/tools/<id>/  → owner only
    DELETE /api/tools/<id>/  → owner only
    """

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def _get_tool_or_404(self, tool_id):
        try:
            return Tool.objects.select_related('owner', 'category', 'city') \
                               .prefetch_related('images') \
                               .get(pk=tool_id)
        except Tool.DoesNotExist:
            return None

    # ── GET ──────────────────────────────────

    def get(self, request, tool_id):
        tool = self._get_tool_or_404(tool_id)
        if not tool:
            return Response(
                {'status': 'error', 'message': 'Tool not found'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = ToolDetailSerializer(tool, context={'request': request})
        return Response({'status': 'success', 'data': serializer.data})

    # ── PATCH ─────────────────────────────────

    def patch(self, request, tool_id):
        tool = self._get_tool_or_404(tool_id)
        if not tool:
            return Response(
                {'status': 'error', 'message': 'Tool not found'},
                status=status.HTTP_404_NOT_FOUND,
            )
        if not is_owner(request.user, tool):
            return Response(
                {'status': 'error', 'message': 'You do not have permission to edit this tool'},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ToolWriteSerializer(tool, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(
                {'status': 'error', 'message': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer.save()
        updated = self._get_tool_or_404(tool_id)   # re-fetch with relations
        return Response({
            'status': 'success',
            'data'  : ToolDetailSerializer(updated, context={'request': request}).data,
        })

    # ── DELETE ────────────────────────────────

    def delete(self, request, tool_id):
        tool = self._get_tool_or_404(tool_id)
        if not tool:
            return Response(
                {'status': 'error', 'message': 'Tool not found'},
                status=status.HTTP_404_NOT_FOUND,
            )
        if not is_owner(request.user, tool):
            return Response(
                {'status': 'error', 'message': 'You do not have permission to delete this tool'},
                status=status.HTTP_403_FORBIDDEN,
            )
        tool.delete()
        return Response({'status': 'success', 'message': 'Tool deleted'})


# ─────────────────────────────────────────────
# Availability Calendar
# ─────────────────────────────────────────────

class ToolAvailabilityView(APIView):
    """
    GET /api/tools/<id>/availability/?month=YYYY-MM

    Returns every date inside the requested month that is already covered
    by a confirmed or active rental for this tool.
    Cancelled / disputed rentals do NOT block the calendar.
    """
    permission_classes = [AllowAny]

    BLOCKING_STATUSES = ('pending', 'confirmed', 'active')

    def get(self, request, tool_id):
        try:
            tool = Tool.objects.get(pk=tool_id)
        except Tool.DoesNotExist:
            return Response(
                {'status': 'error', 'message': 'Tool not found'},
                status=status.HTTP_404_NOT_FOUND,
            )

        month_param = request.query_params.get('month')   # e.g. "2025-06"
        if not month_param:
            return Response(
                {'status': 'error', 'message': 'month parameter is required (format: YYYY-MM)'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            year, month = map(int, month_param.split('-'))
        except (ValueError, AttributeError):
            return Response(
                {'status': 'error', 'message': 'Invalid month format. Use YYYY-MM'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        _, last_day = calendar.monthrange(year, month)
        month_start = date(year, month, 1)
        month_end   = date(year, month, last_day)

        # Fetch all rentals that overlap with the requested month
        rentals = tool.rentals.filter(
            status__in=self.BLOCKING_STATUSES,
            start_date__lte=month_end,
            end_date__gte=month_start,
        )

        # Expand every rental into individual dates
        booked = set()
        for rental in rentals:
            start = max(rental.start_date, month_start)
            end   = min(rental.end_date,   month_end)
            current = start
            while current <= end:
                booked.add(current)
                current = date.fromordinal(current.toordinal() + 1)

        booked_dates = sorted(booked)
        return Response({
            'status': 'success',
            'data'  : {'booked_dates': [d.isoformat() for d in booked_dates]},
        })


# ─────────────────────────────────────────────
# Image Upload
# ─────────────────────────────────────────────

class ToolImageUploadView(APIView):
    """
    POST /api/tools/<id>/images/

    Multipart upload of a single image for a tool.
    Only the tool owner can upload images.
    Maximum 5 images per tool (enforced in the serializer).

    If no image is marked as primary yet, the first uploaded image
    automatically becomes the primary thumbnail.
    """
    permission_classes = [IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser]

    def post(self, request, tool_id):
        try:
            tool = Tool.objects.get(pk=tool_id)
        except Tool.DoesNotExist:
            return Response(
                {'status': 'error', 'message': 'Tool not found'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not is_owner(request.user, tool):
            return Response(
                {'status': 'error', 'message': 'You do not have permission to add images to this tool'},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ToolImageUploadSerializer(
            data=request.data,
            context={'tool': tool},
        )
        if not serializer.is_valid():
            return Response(
                {'status': 'error', 'message': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Auto-set first image as primary
        is_primary = not tool.images.filter(is_primary=True).exists()
        image = serializer.save(tool=tool, is_primary=is_primary)

        return Response(
            {
                'status': 'success',
                'data'  : ToolImageUploadSerializer(image).data,
            },
            status=status.HTTP_201_CREATED,
        )


# ─────────────────────────────────────────────
# Reference endpoints
# ─────────────────────────────────────────────

class CategoryListView(APIView):
    """GET /api/categories/ — public, no pagination (small list)"""
    permission_classes = [AllowAny]

    def get(self, request):
        categories = Category.objects.all().order_by('name')
        serializer = CategorySerializer(categories, many=True)
        return Response({'status': 'success', 'data': serializer.data})


class CityListView(APIView):
    """GET /api/cities/ — public, no pagination (small list)"""
    permission_classes = [AllowAny]

    def get(self, request):
        cities     = City.objects.all().order_by('name')
        serializer = CitySerializer(cities, many=True)
        return Response({'status': 'success', 'data': serializer.data})