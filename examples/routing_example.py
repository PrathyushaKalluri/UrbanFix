from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1] / "src"))

from matching_engine import Availability, ExpertProfile, Location, ProblemInput, build_default_engine
from routing_engine import DeterministicResponseSimulator, RoutingEngine


def _experts() -> list[ExpertProfile]:
    return [
        ExpertProfile(
            expert_id="exp-001",
            name="Maria Lopez",
            skills=["plumbing", "pipe repair", "leak detection"],
            categories=["plumbing"],
            location=Location(latitude=40.7306, longitude=-73.9352),
            experience_years=8,
            availability=Availability(status="available", next_available_hours=0),
            rating=4.8,
        ),
        ExpertProfile(
            expert_id="exp-002",
            name="Ken Tan",
            skills=["plumbing", "faucet install", "painting"],
            categories=["plumbing", "painting"],
            location=Location(latitude=40.7128, longitude=-74.0060),
            experience_years=4,
            availability=Availability(status="available", next_available_hours=0),
            rating=4.3,
        ),
        ExpertProfile(
            expert_id="exp-003",
            name="Ava Chen",
            skills=["plumbing", "leak detection"],
            categories=["plumbing"],
            location=Location(latitude=40.7282, longitude=-73.9942),
            experience_years=6,
            availability=Availability(status="available", next_available_hours=0),
            rating=4.6,
        ),
    ]


def main() -> None:
    matching_engine = build_default_engine()
    routing_engine = RoutingEngine(max_experts_to_route=3)

    problem = ProblemInput(
        text="Urgent kitchen pipe leak and seepage near sink",
        location=Location(latitude=40.7300, longitude=-73.9950),
        required_skills=["plumbing", "leak detection"],
        required_experience_years=4,
        max_radius_km=20.0,
    )

    matching_response = matching_engine.match(problem=problem, experts=_experts(), top_k=5)

    # Simulated outcomes: rank-1 rejects, rank-2 accepts, rank-3 gets cancelled.
    simulator = DeterministicResponseSimulator(
        decisions={
            "exp-001": False,
            "exp-002": True,
            "exp-003": False,
        }
    )
    routing_result = routing_engine.route(matching_response.matches, simulator)

    output = {
        "ranked_experts": [
            {
                "expert_id": item.expert_id,
                "expert_name": item.expert_name,
                "total_score": item.total_score,
            }
            for item in matching_response.matches
        ],
        "routing": {
            "assigned_expert_id": routing_result.assigned_expert_id,
            "assigned_expert_name": routing_result.assigned_expert_name,
            "contacted_expert_ids": routing_result.contacted_expert_ids,
            "rejected_expert_ids": routing_result.rejected_expert_ids,
            "cancelled_expert_ids": routing_result.cancelled_expert_ids,
        },
    }

    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
