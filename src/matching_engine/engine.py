from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, List

from .candidate_generator import CandidateGenerator
from .classifier import KeywordMultiLabelClassifier
from .models import ClassificationResult, ExpertProfile, MatchResult, ProblemInput, ScoreBreakdown
from .scoring import WeightedScorer


@dataclass(frozen=True)
class MatchingResponse:
    categories: ClassificationResult
    matches: List[MatchResult]


class MatchingEngine:
    """Coordinates classification, candidate generation, scoring, and ranking."""

    def __init__(
        self,
        classifier: KeywordMultiLabelClassifier,
        candidate_generator: CandidateGenerator,
        weighted_scorer: WeightedScorer,
    ) -> None:
        self._classifier = classifier
        self._candidate_generator = candidate_generator
        self._weighted_scorer = weighted_scorer

    def match(
        self,
        problem: ProblemInput,
        experts: Iterable[ExpertProfile],
        top_k: int = 5,
    ) -> MatchingResponse:
        weighted_categories = self._classifier.classify(problem.text)

        candidates = self._candidate_generator.generate(problem, experts)

        scored: List[MatchResult] = []
        context = {
            "weighted_categories": weighted_categories.weighted_categories,
        }

        for candidate in candidates:
            total, breakdown = self._weighted_scorer.score(candidate, problem, context)
            scored.append(
                MatchResult(
                    expert_id=candidate.expert.expert_id,
                    expert_name=candidate.expert.name,
                    total_score=round(total, 4),
                    breakdown=ScoreBreakdown(
                        skill=round(breakdown.get("skill", 0.0), 4),
                        experience=round(breakdown.get("experience", 0.0), 4),
                        location=round(breakdown.get("location", 0.0), 4),
                        availability=round(breakdown.get("availability", 0.0), 4),
                        rating=round(breakdown.get("rating", 0.0), 4),
                    ),
                )
            )

        ranked = sorted(scored, key=lambda result: result.total_score, reverse=True)
        final_matches = ranked[: max(1, min(top_k, 5))]
        return MatchingResponse(categories=weighted_categories, matches=final_matches)
