from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from typing import Iterable, List, Optional

from cache.expert_cache import ExpertCache

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
        expert_cache: Optional[ExpertCache] = None,
        result_cache_ttl_seconds: int = 120,
    ) -> None:
        self._classifier = classifier
        self._candidate_generator = candidate_generator
        self._weighted_scorer = weighted_scorer
        self._expert_cache = expert_cache
        self._result_cache_ttl_seconds = result_cache_ttl_seconds

    def match(
        self,
        problem: ProblemInput,
        experts: Iterable[ExpertProfile],
        top_k: int = 5,
    ) -> MatchingResponse:
        signature = self._signature(problem, top_k)
        if self._expert_cache is not None:
            cached_payload = self._expert_cache.get_matching_response_payload(signature)
            if cached_payload is not None:
                return self._response_from_payload(cached_payload)

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
        response = MatchingResponse(categories=weighted_categories, matches=final_matches)

        if self._expert_cache is not None:
            self._expert_cache.cache_matching_response(
                signature=signature,
                response=response,
                ttl_seconds=self._result_cache_ttl_seconds,
            )

        return response

    @staticmethod
    def _signature(problem: ProblemInput, top_k: int) -> str:
        normalized = {
            "text": problem.text.strip().lower(),
            "location": {
                "latitude": round(problem.location.latitude, 4),
                "longitude": round(problem.location.longitude, 4),
            },
            "required_skills": sorted(skill.strip().lower() for skill in problem.required_skills),
            "required_experience_years": problem.required_experience_years,
            "max_radius_km": round(problem.max_radius_km, 2),
            "top_k": max(1, min(top_k, 5)),
        }
        payload = json.dumps(normalized, sort_keys=True, separators=(",", ":"))
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()

    @staticmethod
    def _response_from_payload(payload: dict) -> MatchingResponse:
        categories = ClassificationResult(weighted_categories=dict(payload.get("categories", {})))
        matches: List[MatchResult] = []

        for item in payload.get("matches", []):
            breakdown = item.get("breakdown", {})
            matches.append(
                MatchResult(
                    expert_id=item.get("expert_id", ""),
                    expert_name=item.get("expert_name", ""),
                    total_score=float(item.get("total_score", 0.0)),
                    breakdown=ScoreBreakdown(
                        skill=float(breakdown.get("skill", 0.0)),
                        experience=float(breakdown.get("experience", 0.0)),
                        location=float(breakdown.get("location", 0.0)),
                        availability=float(breakdown.get("availability", 0.0)),
                        rating=float(breakdown.get("rating", 0.0)),
                    ),
                )
            )

        return MatchingResponse(categories=categories, matches=matches)
