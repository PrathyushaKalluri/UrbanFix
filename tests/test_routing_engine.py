from __future__ import annotations

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1] / "src"))

from matching_engine.models import MatchResult, ScoreBreakdown
from routing_engine import DeterministicResponseSimulator, RoutingEngine


def _ranked_experts() -> list[MatchResult]:
    return [
        MatchResult(
            expert_id="exp-001",
            expert_name="Maria Lopez",
            total_score=0.95,
            breakdown=ScoreBreakdown(
                skill=0.30,
                experience=0.25,
                location=0.20,
                availability=0.10,
                rating=0.10,
            ),
        ),
        MatchResult(
            expert_id="exp-002",
            expert_name="Ken Tan",
            total_score=0.89,
            breakdown=ScoreBreakdown(
                skill=0.28,
                experience=0.23,
                location=0.18,
                availability=0.10,
                rating=0.10,
            ),
        ),
        MatchResult(
            expert_id="exp-003",
            expert_name="Ava Chen",
            total_score=0.84,
            breakdown=ScoreBreakdown(
                skill=0.26,
                experience=0.22,
                location=0.16,
                availability=0.10,
                rating=0.10,
            ),
        ),
        MatchResult(
            expert_id="exp-004",
            expert_name="Luis Park",
            total_score=0.80,
            breakdown=ScoreBreakdown(
                skill=0.24,
                experience=0.20,
                location=0.16,
                availability=0.10,
                rating=0.10,
            ),
        ),
    ]


def test_routes_to_first_expert_when_top_accepts() -> None:
    engine = RoutingEngine(max_experts_to_route=3)
    simulator = DeterministicResponseSimulator(
        decisions={
            "exp-001": True,
            "exp-002": False,
            "exp-003": False,
        }
    )

    result = engine.route(_ranked_experts(), simulator)

    assert result.assigned_expert_id == "exp-001"
    assert result.contacted_expert_ids == ["exp-001"]
    assert result.rejected_expert_ids == []
    assert result.cancelled_expert_ids == ["exp-002", "exp-003"]


def test_falls_back_to_second_expert_when_top_rejects() -> None:
    engine = RoutingEngine(max_experts_to_route=3)
    simulator = DeterministicResponseSimulator(
        decisions={
            "exp-001": False,
            "exp-002": True,
            "exp-003": False,
        }
    )

    result = engine.route(_ranked_experts(), simulator)

    assert result.assigned_expert_id == "exp-002"
    assert result.contacted_expert_ids == ["exp-001", "exp-002"]
    assert result.rejected_expert_ids == ["exp-001"]
    assert result.cancelled_expert_ids == ["exp-003"]


def test_returns_unassigned_when_all_top_experts_reject() -> None:
    engine = RoutingEngine(max_experts_to_route=3)
    simulator = DeterministicResponseSimulator(
        decisions={
            "exp-001": False,
            "exp-002": False,
            "exp-003": False,
        }
    )

    result = engine.route(_ranked_experts(), simulator)

    assert result.assigned_expert_id is None
    assert result.contacted_expert_ids == ["exp-001", "exp-002", "exp-003"]
    assert result.rejected_expert_ids == ["exp-001", "exp-002", "exp-003"]
    assert result.cancelled_expert_ids == []
