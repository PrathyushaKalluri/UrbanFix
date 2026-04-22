from __future__ import annotations

import hashlib
import json
import re
from dataclasses import dataclass
from typing import Dict, List, Tuple

from ..core.cache import CacheProvider
from ..core.config import settings
from ..core.geo import haversine_km
from ..core.sharding import SpatialShardRouter
from ..core.shard_store import ShardExpertStore
from ..db.repository import Repository


KEYWORD_MAP: Dict[str, List[str]] = {
    "Plumbing": ["plumb", "pipe", "leak", "drain", "faucet", "tap", "sink", "pipeline", "bathroom"],
    "Electrical": ["electrical", "wire", "wiring", "switch", "breaker", "mcb", "socket", "inverter", "fan", "circuit", "appliance"],
    "HVAC": ["ac", "air condition", "cooling", "hvac", "compressor", "gas refill", "filter", "service", "ventilation"],
    "Carpentry": ["carpentry", "wood", "door", "hinge", "furniture", "cabinet", "shelf", "woodwork"],
    "Painting": ["paint", "wall", "coating", "finishing", "renovation", "interior", "decor"],
    "Locksmith": ["lock", "unlock", "key", "security", "bolt"],
    "Handyman": ["repair", "fix", "maintenance", "general"],
}


@dataclass(frozen=True)
class ScoredExpert:
    candidate: object
    expert_id: int
    full_name: str
    primary_expertise: str
    score: float
    breakdown: Dict[str, float]
    reasons: List[str]


class MatchingService:
    def __init__(
        self,
        repository: Repository,
        cache: CacheProvider | None = None,
        shard_router: SpatialShardRouter | None = None,
        shard_store: ShardExpertStore | None = None,
    ) -> None:
        self.repository = repository
        self.cache = cache
        self.shard_router = shard_router
        self.shard_store = shard_store

    def recommend(
        self,
        problem_text: str,
        top_n: int = 5,
        required_experience_years: int | None = None,
        *,
        latitude: float | None = None,
        longitude: float | None = None,
        radius_km: float = 15.0,
    ) -> Dict[str, object]:
        location_enabled = latitude is not None and longitude is not None
        region_buckets = None
        if location_enabled and self.shard_router is not None:
            region_buckets = self.shard_router.buckets_for_radius(latitude, longitude, radius_km)

        def within_radius(candidate) -> bool:
            if not location_enabled:
                return True
            if candidate.latitude is None or candidate.longitude is None:
                return False
            return haversine_km(latitude, longitude, candidate.latitude, candidate.longitude) <= radius_km

        if self.shard_store is not None:
            shard_result = self.shard_store.query_experts(
                available_only=True,
                search=None,
                primary_expertise=None,
                expertise_area=None,
                serves_as_resident=None,
                min_years_experience=None,
                max_years_experience=None,
                region_buckets=region_buckets,
                page=1,
                page_size=100000,
            )
            signature = shard_result["signature"]
        else:
            signature = self.repository.expert_catalog_signature(available_only=True, region_buckets=region_buckets)
        cache_key = self._cache_key(
            "expert-match",
            {
                "problem_text": problem_text,
                "top_n": top_n,
                "required_experience_years": required_experience_years,
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
            shard_rows = self.shard_store.query_experts(
                available_only=True,
                search=None,
                primary_expertise=None,
                expertise_area=None,
                serves_as_resident=None,
                min_years_experience=None,
                max_years_experience=None,
                region_buckets=region_buckets,
                page=1,
                page_size=100000,
            )["items"]
            candidates = [self._candidate_from_dict(item) for item in shard_rows]
        else:
            candidates = self.repository.expert_rows(available_only=True, region_buckets=region_buckets)
        candidates = [candidate for candidate in candidates if within_radius(candidate)]
        request_terms = self._infer_terms(problem_text)
        scored = [
            self._score_candidate(
                candidate,
                request_terms,
                required_experience_years,
                latitude=latitude,
                longitude=longitude,
                radius_km=radius_km,
            )
            for candidate in candidates
        ]
        ranked = sorted(scored, key=lambda item: item.score, reverse=True)[:top_n]
        response = {
            "request_text": problem_text,
            "suggestions": [
                {
                    "expert_id": item.candidate.expert_id,
                    "user_id": item.candidate.user_id,
                    "full_name": item.candidate.full_name,
                    "primary_expertise": item.candidate.primary_expertise,
                    "years_of_experience": item.candidate.years_of_experience,
                    "bio": getattr(item.candidate, "bio", None),
                    "available": item.candidate.available,
                    "serves_as_resident": item.candidate.serves_as_resident,
                    "expertise_areas": item.candidate.expertise_areas,
                    "score": round(item.score, 4),
                    "breakdown": {key: round(value, 4) for key, value in item.breakdown.items()},
                    "reasons": item.reasons,
                }
                for item in ranked
            ],
        }
        if self.cache is not None:
            self.cache.set(cache_key, response, ttl_seconds=settings.matching_cache_ttl_seconds)
        return response

    def _infer_terms(self, problem_text: str) -> List[str]:
        normalized = problem_text.lower()
        inferred: List[str] = []
        for category, keywords in KEYWORD_MAP.items():
            if any(keyword in normalized for keyword in keywords):
                inferred.append(category)

        tokens = set(re.findall(r"[a-zA-Z0-9-]+", normalized))
        inferred.extend(token.title() for token in tokens if len(token) > 4)
        return sorted(set(inferred))

    def _score_candidate(
        self,
        candidate,
        request_terms: List[str],
        required_experience_years: int | None,
        *,
        latitude: float | None,
        longitude: float | None,
        radius_km: float,
    ) -> ScoredExpert:
        expertise_tokens = {candidate.primary_expertise.lower(), *[skill.lower() for skill in candidate.expertise_areas]}
        term_tokens = {term.lower() for term in request_terms}

        overlap = len(expertise_tokens.intersection(term_tokens))
        request_scale = max(len(term_tokens), 1)
        skill_score = overlap / request_scale

        required = required_experience_years if required_experience_years is not None else 5
        experience_score = min(candidate.years_of_experience / max(required, 1), 1.0)

        availability_score = 1.0 if candidate.available else 0.0
        response_score = max(0.0, 1.0 - (candidate.avg_response_time_sec / 1200.0))

        reputation_base = (candidate.avg_rating / 5.0) if candidate.avg_rating else 0.0
        reputation_bonus = (candidate.acceptance_rate / 100.0) * 0.5 + (candidate.completion_rate / 100.0) * 0.5
        reputation_score = min(1.0, (reputation_base * 0.6) + (reputation_bonus * 0.4))
        location_score = 0.0
        if (
            latitude is not None
            and longitude is not None
            and candidate.latitude is not None
            and candidate.longitude is not None
        ):
            distance = haversine_km(latitude, longitude, candidate.latitude, candidate.longitude)
            location_score = max(0.0, 1.0 - (distance / max(radius_km, 1.0)))

        total = (
            0.45 * skill_score
            + 0.25 * experience_score
            + 0.15 * availability_score
            + 0.10 * reputation_score
            + 0.05 * response_score
        )
        total += 0.05 * location_score

        reasons = []
        matched_terms = sorted(expertise_tokens.intersection(term_tokens))
        if matched_terms:
            reasons.append(f"Skill overlap: {', '.join(matched_terms)}")
        reasons.append(f"{candidate.years_of_experience} years experience")
        reasons.append("Currently available" if candidate.available else "Temporarily unavailable")
        reasons.append(f"Rating {candidate.avg_rating:.1f}/5")
        if candidate.region_bucket:
            reasons.append(f"Assigned to shard bucket {candidate.region_bucket}")

        return ScoredExpert(
            candidate=candidate,
            expert_id=candidate.expert_id,
            full_name=candidate.full_name,
            primary_expertise=candidate.primary_expertise,
            score=total,
            breakdown={
                "skill": skill_score,
                "experience": experience_score,
                "availability": availability_score,
                "reputation": reputation_score,
                "response": response_score,
                "location": location_score,
            },
            reasons=reasons,
        )

    @staticmethod
    def _cache_key(prefix: str, payload: Dict[str, object]) -> str:
        encoded = json.dumps(payload, sort_keys=True, default=str).encode("utf-8")
        digest = hashlib.sha256(encoded).hexdigest()
        return f"{prefix}:{digest}"

    def _candidate_from_dict(self, item: Dict[str, object]):
        from types import SimpleNamespace

        return SimpleNamespace(
            expert_id=int(item["expert_id"]),
            user_id=int(item["user_id"]),
            full_name=str(item["full_name"]),
            email=str(item["email"]),
            primary_expertise=str(item["primary_expertise"]),
            years_of_experience=int(item["years_of_experience"]),
            bio=item.get("bio"),
            available=bool(item.get("available", False)),
            serves_as_resident=bool(item.get("serves_as_resident", False)),
            expertise_areas=list(item.get("expertise_areas", [])),
            avg_rating=float(item.get("avg_rating", 0.0) or 0.0),
            total_jobs=int(item.get("total_jobs", 0) or 0),
            acceptance_rate=float(item.get("acceptance_rate", 0.0) or 0.0),
            completion_rate=float(item.get("completion_rate", 0.0) or 0.0),
            cancellation_rate=float(item.get("cancellation_rate", 0.0) or 0.0),
            avg_response_time_sec=int(item.get("avg_response_time_sec", 0) or 0),
            latitude=item.get("latitude"),
            longitude=item.get("longitude"),
            city=item.get("city"),
            region_bucket=item.get("region_bucket"),
            shard_id=item.get("shard_id"),
        )
