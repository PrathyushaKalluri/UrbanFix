from __future__ import annotations

import math
from typing import Tuple


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    earth_radius_km = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    h = math.sin(dphi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0) ** 2
    return 2.0 * earth_radius_km * math.atan2(math.sqrt(h), math.sqrt(1.0 - h))


def bounding_box(latitude: float, longitude: float, radius_km: float) -> Tuple[float, float, float, float]:
    delta_lat = radius_km / 111.0
    cos_lat = math.cos(math.radians(latitude))
    if abs(cos_lat) < 1e-9:
        delta_lon = 180.0
    else:
        delta_lon = radius_km / (111.0 * cos_lat)

    return (
        latitude - delta_lat,
        latitude + delta_lat,
        longitude - delta_lon,
        longitude + delta_lon,
    )