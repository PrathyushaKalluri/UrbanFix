from __future__ import annotations

from bisect import bisect_left, bisect_right
from dataclasses import dataclass
from typing import Iterable, List, Literal, Protocol, Sequence, Tuple

from .geo import bounding_box, haversine_km
from .models import ExpertProfile, Location
from .quadtree_index import QuadTreeSpatialIndex


class ExpertSpatialIndex(Protocol):
    def query_within_radius(self, center: Location, radius_km: float) -> List[ExpertProfile]:
        pass


@dataclass
class SortedLatitudeSpatialIndex:
    """Simple in-memory spatial index.

    Keeps experts sorted by latitude, then narrows search candidates via binary search
    before accurate Haversine filtering. This demonstrates the pathway from O(n)
    full scans toward index-assisted O(log n + k) range queries.
    """

    experts: Sequence[ExpertProfile]

    def __post_init__(self) -> None:
        rows: List[Tuple[float, ExpertProfile]] = sorted(
            ((expert.location.latitude, expert) for expert in self.experts),
            key=lambda item: item[0],
        )
        self._latitudes = [row[0] for row in rows]
        self._experts_sorted = [row[1] for row in rows]

    def query_within_radius(self, center: Location, radius_km: float) -> List[ExpertProfile]:
        min_lat, max_lat, _, _ = bounding_box(center, radius_km)

        start = bisect_left(self._latitudes, min_lat)
        end = bisect_right(self._latitudes, max_lat)
        subset = self._experts_sorted[start:end]

        return [
            expert
            for expert in subset
            if haversine_km(center, expert.location) <= radius_km
        ]


def maybe_build_spatial_index(experts: Iterable[ExpertProfile], threshold: int = 2000) -> ExpertSpatialIndex | None:
    pool = list(experts)
    if len(pool) < threshold:
        return None

    # Keep sorted-latitude as low-overhead default; quadtree is production-oriented.
    return SortedLatitudeSpatialIndex(pool)


def build_spatial_index(
    experts: Iterable[ExpertProfile],
    backend: Literal["sorted-latitude", "quadtree", "auto"] = "auto",
    threshold: int = 2000,
) -> ExpertSpatialIndex | None:
    pool = list(experts)
    if len(pool) < threshold:
        return None

    if backend == "quadtree":
        return QuadTreeSpatialIndex(pool)
    if backend == "sorted-latitude":
        return SortedLatitudeSpatialIndex(pool)

    # Auto mode prefers quadtree once dataset is large enough for production-like usage.
    if len(pool) >= max(threshold, 10000):
        return QuadTreeSpatialIndex(pool)
    return SortedLatitudeSpatialIndex(pool)
