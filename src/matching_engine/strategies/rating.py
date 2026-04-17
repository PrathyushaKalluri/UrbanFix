from __future__ import annotations

from typing import Dict

from .base import ScoringStrategy
from ..models import Candidate, ProblemInput


class RatingStrategy(ScoringStrategy):
    @property
    def name(self) -> str:
        return "rating"

    def score(
        self,
        problem: ProblemInput,
        candidate: Candidate,
        context: Dict[str, object],
    ) -> float:
        normalized = candidate.expert.rating / 5.0
        return self.clamp(normalized)
