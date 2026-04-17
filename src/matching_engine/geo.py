from __future__ import annotations

import math

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
