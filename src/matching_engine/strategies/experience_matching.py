from __future__ import annotations

from typing import Dict

from .base import ScoringStrategy
from ..models import Candidate, ProblemInput


class ExperienceMatchingStrategy(ScoringStrategy):
    @property
    def name(self) -> str:
        return "experience"

    def score(
        self,
        problem: ProblemInput,
        candidate: Candidate,
        context: Dict[str, object],
    ) -> float:
        required = max(problem.required_experience_years, 0)
        actual = max(candidate.expert.experience_years, 0)

        if required == 0:
            return 1.0

        ratio = actual / required
        return self.clamp(ratio)
