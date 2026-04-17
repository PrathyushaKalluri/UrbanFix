from __future__ import annotations

from dataclasses import asdict
from typing import TYPE_CHECKING, Optional

from matching_engine.models import ExpertProfile

from .abstractions import CacheProvider

if TYPE_CHECKING:
    from matching_engine.engine import MatchingResponse


class ExpertCache:
    def __init__(self, cache: CacheProvider) -> None:
        self._cache = cache

    @staticmethod
    def profile_key(expert_id: str) -> str:
        return f"expert:profile:{expert_id}"

    @staticmethod
    def results_key(signature: str) -> str:
        return f"match:result:{signature}"

    def cache_expert_profile(self, expert: ExpertProfile, ttl_seconds: int = 900) -> None:
        self._cache.set(self.profile_key(expert.expert_id), expert, ttl_seconds=ttl_seconds)

    def get_expert_profile(self, expert_id: str) -> Optional[ExpertProfile]:
        cached = self._cache.get(self.profile_key(expert_id))
        if isinstance(cached, ExpertProfile):
            return cached
        return None

    def cache_matching_response(self, signature: str, response: MatchingResponse, ttl_seconds: int = 120) -> None:
        # Store plain dict payload to remain Redis-serialization friendly.
        payload = {
            "categories": dict(response.categories.weighted_categories),
            "matches": [
                {
                    "expert_id": match.expert_id,
                    "expert_name": match.expert_name,
                    "total_score": match.total_score,
                    "breakdown": asdict(match.breakdown),
                }
                for match in response.matches
            ],
        }
        self._cache.set(self.results_key(signature), payload, ttl_seconds=ttl_seconds)

    def get_matching_response_payload(self, signature: str) -> Optional[dict]:
        payload = self._cache.get(self.results_key(signature))
        if isinstance(payload, dict):
            return payload
        return None
