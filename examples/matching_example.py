from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1] / "src"))

from matching_engine import Availability, ExpertProfile, Location, ProblemInput, build_default_engine


def build_sample_experts() -> list[ExpertProfile]:
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
            skills=["painting", "wall coating", "surface prep"],
            categories=["painting"],
            location=Location(latitude=40.7510, longitude=-73.9690),
            experience_years=5,
            availability=Availability(status="busy", next_available_hours=12),
            rating=4.5,
        ),
        ExpertProfile(
            expert_id="exp-003",
            name="Ava Chen",
            skills=["plumbing", "faucet install", "painting"],
            categories=["plumbing", "painting"],
            location=Location(latitude=40.7128, longitude=-74.0060),
            experience_years=4,
            availability=Availability(status="available", next_available_hours=0),
            rating=4.2,
        ),
        ExpertProfile(
            expert_id="exp-004",
            name="Luis Park",
            skills=["plumbing", "pipe repair"],
            categories=["plumbing"],
            location=Location(latitude=40.9000, longitude=-74.4000),
            experience_years=10,
            availability=Availability(status="available", next_available_hours=0),
            rating=4.9,
        ),
    ]


def main() -> None:
    engine = build_default_engine()
    problem = ProblemInput(
        text="Kitchen faucet leak and damp wall, may need paint touch up after pipe fix",
        location=Location(latitude=40.7300, longitude=-73.9950),
        required_skills=["plumbing", "leak detection", "painting"],
        required_experience_years=4,
        max_radius_km=20.0,
    )

    response = engine.match(problem, build_sample_experts(), top_k=5)

    output = {
        "weighted_categories": response.categories.weighted_categories,
        "matches": [
            {
                "expert_id": match.expert_id,
                "expert_name": match.expert_name,
                "total_score": match.total_score,
                "breakdown": {
                    "skill": match.breakdown.skill,
                    "experience": match.breakdown.experience,
                    "location": match.breakdown.location,
                    "availability": match.breakdown.availability,
                    "rating": match.breakdown.rating,
                },
            }
            for match in response.matches
        ],
    }

    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
