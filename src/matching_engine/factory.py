from __future__ import annotations

from typing import Literal, Optional

from cache import ExpertCache, InMemoryCacheProvider, RedisCacheProvider

from .candidate_generator import CandidateGenerator
from .classifier import KeywordMultiLabelClassifier
from .engine import MatchingEngine
from .scoring import WeightedScorer, WeightedStrategy
from .strategies.availability import AvailabilityStrategy
from .strategies.experience_matching import ExperienceMatchingStrategy
from .strategies.location_scoring import LocationScoringStrategy
from .strategies.rating import RatingStrategy
from .strategies.skill_similarity import SkillSimilarityStrategy


def build_default_engine(
    enable_result_cache: bool = False,
    result_cache_ttl_seconds: int = 120,
    spatial_index_threshold: int = 2000,
    spatial_index_backend: Literal["auto", "sorted-latitude", "quadtree"] = "auto",
    cache_backend: Literal["in-memory", "redis"] = "in-memory",
    redis_url: Optional[str] = None,
    redis_key_prefix: str = "urbanfix:",
) -> MatchingEngine:
    classifier = KeywordMultiLabelClassifier(
        category_keywords={
            "plumbing": ["leak", "pipe", "faucet", "drain", "plumbing"],
            "painting": ["paint", "wall", "ceiling", "coating"],
            "electrical": ["wire", "switch", "socket", "breaker", "electrical"],
            "carpentry": ["wood", "cabinet", "door", "furniture", "carpentry"],
        }
    )

    scorer = WeightedScorer(
        weighted_strategies=[
            WeightedStrategy(SkillSimilarityStrategy(), 0.30),
            WeightedStrategy(ExperienceMatchingStrategy(), 0.25),
            WeightedStrategy(LocationScoringStrategy(), 0.20),
            WeightedStrategy(AvailabilityStrategy(), 0.15),
            WeightedStrategy(RatingStrategy(), 0.10),
        ]
    )

    cache = None
    if enable_result_cache:
        if cache_backend == "redis":
            cache_provider = RedisCacheProvider(
                redis_url=redis_url or "redis://localhost:6379/0",
                key_prefix=redis_key_prefix,
            )
        else:
            cache_provider = InMemoryCacheProvider()
        cache = ExpertCache(cache_provider)

    return MatchingEngine(
        classifier=classifier,
        candidate_generator=CandidateGenerator(
            auto_index_threshold=spatial_index_threshold,
            spatial_index_backend=spatial_index_backend,
        ),
        weighted_scorer=scorer,
        expert_cache=cache,
        result_cache_ttl_seconds=result_cache_ttl_seconds,
    )
