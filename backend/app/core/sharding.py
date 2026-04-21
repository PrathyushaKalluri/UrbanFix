from __future__ import annotations

from dataclasses import dataclass
from hashlib import sha256
from math import floor
from typing import Iterable, List, Sequence

from .geo import bounding_box


@dataclass(frozen=True)
class ShardRoute:
    region_bucket: str
    shard_id: int
    candidate_buckets: tuple[str, ...]


class SpatialShardRouter:
    def __init__(self, shard_count: int = 16, cell_size_degrees: float = 1.0) -> None:
        self.shard_count = max(1, shard_count)
        self.cell_size_degrees = max(0.1, cell_size_degrees)

    def bucket_for_point(self, latitude: float, longitude: float) -> str:
        return f"{self._band(latitude, 90.0)}:{self._band(longitude, 180.0)}"

    def shard_id_for_bucket(self, bucket: str) -> int:
        digest = sha256(bucket.encode("utf-8")).hexdigest()
        return int(digest[:8], 16) % self.shard_count

    def route_for_point(self, latitude: float, longitude: float, radius_km: float = 0.0) -> ShardRoute:
        bucket = self.bucket_for_point(latitude, longitude)
        candidate_buckets = tuple(sorted(self.buckets_for_radius(latitude, longitude, radius_km)))
        return ShardRoute(region_bucket=bucket, shard_id=self.shard_id_for_bucket(bucket), candidate_buckets=candidate_buckets)

    def buckets_for_radius(self, latitude: float, longitude: float, radius_km: float) -> List[str]:
        min_lat, max_lat, min_lon, max_lon = bounding_box(latitude, longitude, radius_km)
        lat_start = self._band(min_lat, 90.0)
        lat_end = self._band(max_lat, 90.0)
        lon_start = self._band(min_lon, 180.0)
        lon_end = self._band(max_lon, 180.0)

        buckets: List[str] = []
        for lat_band in range(lat_start, lat_end + 1):
            for lon_band in range(lon_start, lon_end + 1):
                buckets.append(f"{lat_band}:{lon_band}")
        return buckets

    def route_many(self, buckets: Iterable[str]) -> List[int]:
        return sorted({self.shard_id_for_bucket(bucket) for bucket in buckets})

    def _band(self, value: float, offset: float) -> int:
        return int(floor((value + offset) / self.cell_size_degrees))
