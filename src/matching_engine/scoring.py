from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Iterable

from .models import Candidate
from .strategies.base import ScoringStrategy


@dataclass(frozen=True)
class WeightedStrategy:
    strategy: ScoringStrategy
    weight: float


class WeightedScorer:
    def __init__(self, weighted_strategies: Iterable[WeightedStrategy]) -> None:
        items = list(weighted_strategies)
        if not items:
            raise ValueError("At least one scoring strategy is required.")

        weight_sum = sum(item.weight for item in items)
        if abs(weight_sum - 1.0) > 1e-9:
            raise ValueError(f"Scoring weights must sum to 1.0 (got {weight_sum}).")

        self._weighted_strategies = items

    def score(
        self,
        candidate: Candidate,
        problem,
        context: Dict[str, object],
    ) -> tuple[float, Dict[str, float]]:
        breakdown: Dict[str, float] = {}
        total = 0.0

        for weighted in self._weighted_strategies:
            strategy_score = weighted.strategy.score(problem, candidate, context)
            breakdown[weighted.strategy.name] = strategy_score
            total += weighted.weight * strategy_score

        return total, breakdown
