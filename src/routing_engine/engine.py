from __future__ import annotations

import random
from dataclasses import dataclass
from typing import Dict, Iterable, List, Optional

from matching_engine.models import MatchResult

from .abstractions import ExpertResponseSimulator
from .chain import (
    ExpertOfferHandler,
    RoutingChain,
    RoutingContext,
    RoutingResult,
    build_routing_result,
)


class DeterministicResponseSimulator(ExpertResponseSimulator):
    """Deterministic simulator for tests and predictable demos."""

    def __init__(self, decisions: Dict[str, bool]) -> None:
        self._decisions = dict(decisions)

    def accepts(self, expert_id: str, rank: int) -> bool:
        del rank
        return bool(self._decisions.get(expert_id, False))


class ProbabilisticResponseSimulator(ExpertResponseSimulator):
    """Simple simulator that accepts with a configurable probability."""

    def __init__(self, accept_probability: float = 0.5, seed: Optional[int] = None) -> None:
        self._accept_probability = max(0.0, min(1.0, accept_probability))
        self._rng = random.Random(seed)

    def accepts(self, expert_id: str, rank: int) -> bool:
        del expert_id
        del rank
        return self._rng.random() <= self._accept_probability


@dataclass
class RoutingEngine:
    """Assigns a job to ranked experts using fallback chain routing."""

    max_experts_to_route: int = 3

    def route(
        self,
        ranked_experts: Iterable[MatchResult],
        simulator: ExpertResponseSimulator,
    ) -> RoutingResult:
        top_experts: List[MatchResult] = list(ranked_experts)[: max(0, self.max_experts_to_route)]
        handlers = [
            ExpertOfferHandler(expert=expert, rank=index)
            for index, expert in enumerate(top_experts, start=1)
        ]
        chain = RoutingChain(handlers=handlers)
        context = RoutingContext(experts=top_experts, simulator=simulator)

        chain.execute(context)
        return build_routing_result(context)
