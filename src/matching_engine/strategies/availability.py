from __future__ import annotations

from typing import Dict

from .base import ScoringStrategy
from ..models import Candidate, ProblemInput


class AvailabilityStrategy(ScoringStrategy):
    @property
    def name(self) -> str:
        return "availability"

    def score(
        self,
        problem: ProblemInput,
        candidate: Candidate,
        context: Dict[str, object],
    ) -> float:
        status = candidate.expert.availability.status.lower()
        next_available_hours = max(candidate.expert.availability.next_available_hours, 0)

        if status == "available":
            return 1.0
        if status == "busy":
            # Penalize long delays while still allowing close-to-available experts.
            return self.clamp(1.0 - (next_available_hours / 72.0))
        return 0.0
