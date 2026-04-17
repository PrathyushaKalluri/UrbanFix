from __future__ import annotations

from .candidate_generator import CandidateGenerator
from .classifier import KeywordMultiLabelClassifier
from .engine import MatchingEngine
from .scoring import WeightedScorer, WeightedStrategy
from .strategies.availability import AvailabilityStrategy
from .strategies.experience_matching import ExperienceMatchingStrategy
from .strategies.location_scoring import LocationScoringStrategy
from .strategies.rating import RatingStrategy
from .strategies.skill_similarity import SkillSimilarityStrategy


def build_default_engine() -> MatchingEngine:
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

    return MatchingEngine(
        classifier=classifier,
        candidate_generator=CandidateGenerator(),
        weighted_scorer=scorer,
    )
