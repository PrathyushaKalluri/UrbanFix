from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional, Sequence

from matching_engine.models import MatchResult

from .abstractions import ExpertResponseSimulator


@dataclass(frozen=True)
class RoutingAttempt:
    expert_id: str
    expert_name: str
    rank: int
    accepted: bool


@dataclass(frozen=True)
class RoutingResult:
    assigned_expert_id: Optional[str]
    assigned_expert_name: Optional[str]
    contacted_expert_ids: List[str]
    rejected_expert_ids: List[str]
    cancelled_expert_ids: List[str]
    attempts: List[RoutingAttempt]


@dataclass
class RoutingContext:
    experts: Sequence[MatchResult]
    simulator: ExpertResponseSimulator
    attempts: List[RoutingAttempt] = field(default_factory=list)
    assigned: Optional[MatchResult] = None


class RoutingHandler:
    """Classic Chain of Responsibility base handler."""

    def __init__(self) -> None:
        self._next: Optional["RoutingHandler"] = None

    def set_next(self, handler: "RoutingHandler") -> "RoutingHandler":
        self._next = handler
        return handler

    def handle(self, context: RoutingContext) -> Optional[MatchResult]:
        if self._next is None:
            return None
        return self._next.handle(context)


class ExpertOfferHandler(RoutingHandler):
    def __init__(self, expert: MatchResult, rank: int) -> None:
        super().__init__()
        self._expert = expert
        self._rank = rank

    def handle(self, context: RoutingContext) -> Optional[MatchResult]:
        accepted = context.simulator.accepts(self._expert.expert_id, self._rank)
        context.attempts.append(
            RoutingAttempt(
                expert_id=self._expert.expert_id,
                expert_name=self._expert.expert_name,
                rank=self._rank,
                accepted=accepted,
            )
        )

        if accepted:
            context.assigned = self._expert
            return self._expert

        return super().handle(context)


class RoutingChain:
    def __init__(self, handlers: Sequence[RoutingHandler]) -> None:
        self._handlers = list(handlers)

        for current, nxt in zip(self._handlers, self._handlers[1:]):
            current.set_next(nxt)

    def execute(self, context: RoutingContext) -> Optional[MatchResult]:
        if not self._handlers:
            return None
        return self._handlers[0].handle(context)


def build_routing_result(context: RoutingContext) -> RoutingResult:
    contacted = [attempt.expert_id for attempt in context.attempts]
    rejected = [attempt.expert_id for attempt in context.attempts if not attempt.accepted]

    cancelled: List[str] = []
    if context.assigned is not None:
        assigned_rank = next(
            (
                attempt.rank
                for attempt in context.attempts
                if attempt.expert_id == context.assigned.expert_id and attempt.accepted
            ),
            None,
        )

        if assigned_rank is not None:
            cancelled = [
                expert.expert_id
                for idx, expert in enumerate(context.experts, start=1)
                if idx > assigned_rank
            ]

    return RoutingResult(
        assigned_expert_id=context.assigned.expert_id if context.assigned else None,
        assigned_expert_name=context.assigned.expert_name if context.assigned else None,
        contacted_expert_ids=contacted,
        rejected_expert_ids=rejected,
        cancelled_expert_ids=cancelled,
        attempts=list(context.attempts),
    )
