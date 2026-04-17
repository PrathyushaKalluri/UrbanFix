from __future__ import annotations

from typing import Dict

from .base import ScoringStrategy
from ..models import Candidate, ProblemInput


class LocationScoringStrategy(ScoringStrategy):
    @property
    def name(self) -> str:
        return "location"

    def score(
        self,
        problem: ProblemInput,
        candidate: Candidate,
        context: Dict[str, object],
    ) -> float:
        radius = max(problem.max_radius_km, 0.0001)
        normalized = 1.0 - (candidate.distance_km / radius)
        return self.clamp(normalized)
