from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Dict

from ..models import Candidate, ProblemInput


class ScoringStrategy(ABC):
    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @abstractmethod
    def score(
        self,
        problem: ProblemInput,
        candidate: Candidate,
        context: Dict[str, object],
    ) -> float:
        pass

    @staticmethod
    def clamp(value: float) -> float:
        if value < 0.0:
            return 0.0
        if value > 1.0:
            return 1.0
        return value
