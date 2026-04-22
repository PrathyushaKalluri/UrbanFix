from __future__ import annotations

import hashlib
import json
from math import ceil
from typing import Dict, List

from ..core.cache import CacheProvider
from ..core.config import settings
from ..core.geo import haversine_km
from ..core.sharding import SpatialShardRouter
from ..core.shard_store import ShardExpertStore
from ..db.repository import ExpertRow, Repository


class ExpertService:
    def __init__(
        self,
        repository: Repository,
        cache: CacheProvider | None = None,
        shard_router: SpatialShardRouter | None = None,
        shard_store: ShardExpertStore | None = None,
    ) -> None:
        self.repository = repository
        self.cache = cache
        self.shard_router = shard_router or SpatialShardRouter()
        self.shard_store = shard_store

    def list_experts(self, available_only: bool = False) -> List[Dict[str, object]]:
        if self.shard_store is not None:
            shard_result = self.shard_store.query_experts(
                available_only=available_only,
                search=None,
                primary_expertise=None,
                expertise_area=None,
                serves_as_resident=None,
                min_years_experience=None,
                max_years_experience=None,
                region_buckets=None,
                page=1,
                page_size=100000,
            )
            return [self._to_listing_dict(item) for item in shard_result["items"]]
        experts = self.repository.expert_rows(available_only=available_only)
        return [self._to_listing(expert) for expert in experts]

    def get_expert(self, expert_id: int) -> Dict[str, object]:
        if self.shard_store is not None:
            expert_dict = self.shard_store.get_expert(expert_id)
            if expert_dict is not None:
                return self._to_detail_dict(expert_dict)
        expert = self.repository.expert_row_by_id(expert_id)
        if expert is None:
            raise LookupError("Expert not found")
        return self._to_detail(expert)

    def search_experts(
        self,
        *,
        page: int,
        page_size: int,
        available_only: bool = False,
        search: str | None = None,
        primary_expertise: str | None = None,
        expertise_area: str | None = None,
        serves_as_resident: bool | None = None,
        min_years_experience: int | None = None,
        max_years_experience: int | None = None,
        latitude: float | None = None,
        longitude: float | None = None,
        radius_km: float = 15.0,
    ) -> Dict[str, object]:
        location_enabled = latitude is not None and longitude is not None
        region_buckets = self.shard_router.buckets_for_radius(latitude, longitude, radius_km) if location_enabled else None

        def within_radius(item_lat: float | None, item_lon: float | None) -> bool:
            if not location_enabled:
                return True
            if item_lat is None or item_lon is None:
                return False
            return haversine_km(latitude, longitude, float(item_lat), float(item_lon)) <= radius_km

        def sort_items(items: List[Dict[str, object]]) -> List[Dict[str, object]]:
            return sorted(items, key=lambda item: (-int(item["years_of_experience"]), str(item["full_name"]).lower()))

        def paginate(items: List[Dict[str, object]]) -> tuple[List[Dict[str, object]], int, int]:
            total_items_local = len(items)
            start = max(page - 1, 0) * page_size
            end = start + page_size
            return items[start:end], total_items_local, ceil(total_items_local / page_size) if total_items_local else 0

        if self.shard_store is not None:
            signature = self.shard_store.query_experts(
                available_only=available_only,
                search=search,
                primary_expertise=primary_expertise,
                expertise_area=expertise_area,
                serves_as_resident=serves_as_resident,
                min_years_experience=min_years_experience,
                max_years_experience=max_years_experience,
                region_buckets=region_buckets,
                page=1,
                page_size=100000,
            )["signature"]
        else:
            signature = self.repository.expert_catalog_signature(
                available_only=available_only,
                search=search,
                primary_expertise=primary_expertise,
                expertise_area=expertise_area,
                serves_as_resident=serves_as_resident,
                min_years_experience=min_years_experience,
                max_years_experience=max_years_experience,
                region_buckets=region_buckets,
            )
        cache_key = self._cache_key(
            "expert-search",
            {
                "available_only": available_only,
                "page": page,
                "page_size": page_size,
                "search": search,
                "primary_expertise": primary_expertise,
                "expertise_area": expertise_area,
                "serves_as_resident": serves_as_resident,
                "min_years_experience": min_years_experience,
                "max_years_experience": max_years_experience,
                "latitude": latitude,
                "longitude": longitude,
                "radius_km": radius_km,
                "signature": signature,
            },
        )
        if self.cache is not None:
            cached = self.cache.get(cache_key)
            if isinstance(cached, dict):
                return cached

        if self.shard_store is not None:
            fanout = self.shard_store.query_experts(
                available_only=available_only,
                search=search,
                primary_expertise=primary_expertise,
                expertise_area=expertise_area,
                serves_as_resident=serves_as_resident,
                min_years_experience=min_years_experience,
                max_years_experience=max_years_experience,
                region_buckets=region_buckets,
                page_size=100000,
                page=1,
            )
            items = [self._to_listing_dict(item) for item in fanout["items"] if within_radius(item.get("latitude"), item.get("longitude"))]
        else:
            experts = self.repository.expert_rows(
                available_only=available_only,
                search=search,
                primary_expertise=primary_expertise,
                expertise_area=expertise_area,
                serves_as_resident=serves_as_resident,
                min_years_experience=min_years_experience,
                max_years_experience=max_years_experience,
                region_buckets=region_buckets,
            )
            items = [self._to_listing(expert) for expert in experts if within_radius(expert.latitude, expert.longitude)]

        items = sort_items(items)
        items, total_items, total_pages = paginate(items)

        result = {
            "items": items,
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": total_pages,
        }
        if self.cache is not None:
            self.cache.set(cache_key, result, ttl_seconds=settings.expert_list_cache_ttl_seconds)
        return result

    def update_availability(self, user_id: int, available: bool) -> Dict[str, object]:
        self.repository.execute(
            "UPDATE expert_profiles SET is_available = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?",
            [int(available), user_id],
        )
        if self.shard_store is not None:
            expert = self.repository.expert_row_by_id(user_id)
            if expert is not None:
                self.shard_store.upsert_expert(
                    {
                        "expert_id": expert.expert_id,
                        "user_id": expert.user_id,
                        "full_name": expert.full_name,
                        "email": expert.email,
                        "primary_expertise": expert.primary_expertise,
                        "years_of_experience": expert.years_of_experience,
                        "bio": expert.bio,
                        "available": bool(available),
                        "serves_as_resident": expert.serves_as_resident,
                        "expertise_areas": expert.expertise_areas,
                        "avg_rating": expert.avg_rating,
                        "total_jobs": expert.total_jobs,
                        "acceptance_rate": expert.acceptance_rate,
                        "completion_rate": expert.completion_rate,
                        "cancellation_rate": expert.cancellation_rate,
                        "avg_response_time_sec": expert.avg_response_time_sec,
                        "latitude": expert.latitude,
                        "longitude": expert.longitude,
                        "city": expert.city,
                        "region_bucket": expert.region_bucket,
                        "shard_id": expert.shard_id,
                    }
                )
        return self.get_expert(user_id)

    def _to_listing(self, expert: ExpertRow) -> Dict[str, object]:
        return {
            "expert_id": expert.expert_id,
            "user_id": expert.user_id,
            "full_name": expert.full_name,
            "primary_expertise": expert.primary_expertise,
            "years_of_experience": expert.years_of_experience,
            "bio": expert.bio,
            "available": expert.available,
            "serves_as_resident": expert.serves_as_resident,
            "expertise_areas": expert.expertise_areas,
        }

    def _to_detail(self, expert: ExpertRow) -> Dict[str, object]:
        return {
            **self._to_listing(expert),
            "email": expert.email,
            "avg_rating": expert.avg_rating,
            "total_jobs": expert.total_jobs,
            "acceptance_rate": expert.acceptance_rate,
            "completion_rate": expert.completion_rate,
            "cancellation_rate": expert.cancellation_rate,
            "avg_response_time_sec": expert.avg_response_time_sec,
        }

    def _to_listing_dict(self, expert: Dict[str, object]) -> Dict[str, object]:
        return {
            "expert_id": int(expert["expert_id"]),
            "user_id": int(expert["user_id"]),
            "full_name": str(expert["full_name"]),
            "primary_expertise": str(expert["primary_expertise"]),
            "years_of_experience": int(expert["years_of_experience"]),
            "bio": expert.get("bio"),
            "available": bool(expert.get("available", False)),
            "serves_as_resident": bool(expert.get("serves_as_resident", False)),
            "expertise_areas": list(expert.get("expertise_areas", [])),
        }

    def _to_detail_dict(self, expert: Dict[str, object]) -> Dict[str, object]:
        return {
            **self._to_listing_dict(expert),
            "email": str(expert.get("email") or ""),
            "avg_rating": float(expert.get("avg_rating", 0.0) or 0.0),
            "total_jobs": int(expert.get("total_jobs", 0) or 0),
            "acceptance_rate": float(expert.get("acceptance_rate", 0.0) or 0.0),
            "completion_rate": float(expert.get("completion_rate", 0.0) or 0.0),
            "cancellation_rate": float(expert.get("cancellation_rate", 0.0) or 0.0),
            "avg_response_time_sec": int(expert.get("avg_response_time_sec", 0) or 0),
        }

    @staticmethod
    def _cache_key(prefix: str, payload: Dict[str, object]) -> str:
        encoded = json.dumps(payload, sort_keys=True, default=str).encode("utf-8")
        digest = hashlib.sha256(encoded).hexdigest()
        return f"{prefix}:{digest}"
