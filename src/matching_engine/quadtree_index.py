from __future__ import annotations

from dataclasses import dataclass, field
from typing import Iterable, List, Sequence, Tuple

from .geo import bounding_box, haversine_km
from .models import ExpertProfile, Location


@dataclass(frozen=True)
class Bounds:
    min_lat: float
    max_lat: float
    min_lon: float
    max_lon: float

    def intersects(self, other: "Bounds") -> bool:
        return not (
            self.max_lat < other.min_lat
            or self.min_lat > other.max_lat
            or self.max_lon < other.min_lon
            or self.min_lon > other.max_lon
        )

    def contains(self, location: Location) -> bool:
        return (
            self.min_lat <= location.latitude <= self.max_lat
            and self.min_lon <= location.longitude <= self.max_lon
        )


@dataclass
class QuadTreeNode:
    bounds: Bounds
    capacity: int = 64
    depth: int = 0
    max_depth: int = 12
    points: List[ExpertProfile] = field(default_factory=list)
    children: List["QuadTreeNode"] = field(default_factory=list)

    def insert(self, expert: ExpertProfile) -> bool:
        if not self.bounds.contains(expert.location):
            return False

        if len(self.points) < self.capacity or self.depth >= self.max_depth:
            self.points.append(expert)
            return True

        if not self.children:
            self._subdivide()

        for child in self.children:
            if child.insert(expert):
                return True

        # Fallback for numeric edge cases on boundaries.
        self.points.append(expert)
        return True

    def query_range(self, region: Bounds, out: List[ExpertProfile]) -> None:
        if not self.bounds.intersects(region):
            return

        for expert in self.points:
            if region.contains(expert.location):
                out.append(expert)

        for child in self.children:
            child.query_range(region, out)

    def _subdivide(self) -> None:
        mid_lat = (self.bounds.min_lat + self.bounds.max_lat) / 2.0
        mid_lon = (self.bounds.min_lon + self.bounds.max_lon) / 2.0

        self.children = [
            QuadTreeNode(
                bounds=Bounds(self.bounds.min_lat, mid_lat, self.bounds.min_lon, mid_lon),
                capacity=self.capacity,
                depth=self.depth + 1,
                max_depth=self.max_depth,
            ),
            QuadTreeNode(
                bounds=Bounds(self.bounds.min_lat, mid_lat, mid_lon, self.bounds.max_lon),
                capacity=self.capacity,
                depth=self.depth + 1,
                max_depth=self.max_depth,
            ),
            QuadTreeNode(
                bounds=Bounds(mid_lat, self.bounds.max_lat, self.bounds.min_lon, mid_lon),
                capacity=self.capacity,
                depth=self.depth + 1,
                max_depth=self.max_depth,
            ),
            QuadTreeNode(
                bounds=Bounds(mid_lat, self.bounds.max_lat, mid_lon, self.bounds.max_lon),
                capacity=self.capacity,
                depth=self.depth + 1,
                max_depth=self.max_depth,
            ),
        ]

        existing = self.points
        self.points = []
        for expert in existing:
            inserted = False
            for child in self.children:
                if child.insert(expert):
                    inserted = True
                    break
            if not inserted:
                self.points.append(expert)


class QuadTreeSpatialIndex:
    """Quadtree-backed spatial index for production-scale geospatial filtering."""

    def __init__(
        self,
        experts: Sequence[ExpertProfile],
        capacity: int = 64,
        max_depth: int = 12,
    ) -> None:
        self._root = QuadTreeNode(
            bounds=Bounds(min_lat=-90.0, max_lat=90.0, min_lon=-180.0, max_lon=180.0),
            capacity=capacity,
            depth=0,
            max_depth=max_depth,
        )
        for expert in experts:
            self._root.insert(expert)

    def query_within_radius(self, center: Location, radius_km: float) -> List[ExpertProfile]:
        min_lat, max_lat, min_lon, max_lon = bounding_box(center, radius_km)
        region = Bounds(min_lat=min_lat, max_lat=max_lat, min_lon=min_lon, max_lon=max_lon)

        coarse: List[ExpertProfile] = []
        self._root.query_range(region, coarse)

        return [
            expert
            for expert in coarse
            if haversine_km(center, expert.location) <= radius_km
        ]
