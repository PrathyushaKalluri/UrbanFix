from __future__ import annotations

import math
from typing import Tuple

from .models import Location


def haversine_km(a: Location, b: Location) -> float:
    earth_radius_km = 6371.0

    lat1 = math.radians(a.latitude)
    lat2 = math.radians(b.latitude)
    dlat = lat2 - lat1
    dlon = math.radians(b.longitude - a.longitude)

    h = math.sin(dlat / 2.0) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(h), math.sqrt(1.0 - h))
    return earth_radius_km * c


def bounding_box(center: Location, radius_km: float) -> Tuple[float, float, float, float]:
    """Return min_lat, max_lat, min_lon, max_lon for a search radius around center."""
    # Roughly 111km per 1 degree latitude.
    delta_lat = radius_km / 111.0

    # Longitude degree length shrinks as we move away from equator.
    cos_lat = math.cos(math.radians(center.latitude))
    if abs(cos_lat) < 1e-9:
        delta_lon = 180.0
    else:
        delta_lon = radius_km / (111.0 * cos_lat)

    return (
        center.latitude - delta_lat,
        center.latitude + delta_lat,
        center.longitude - delta_lon,
        center.longitude + delta_lon,
    )


def is_within_bounding_box(point: Location, box: Tuple[float, float, float, float]) -> bool:
    min_lat, max_lat, min_lon, max_lon = box
    return min_lat <= point.latitude <= max_lat and min_lon <= point.longitude <= max_lon
