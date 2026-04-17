from __future__ import annotations

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1] / "src"))

import matching_engine.candidate_generator as candidate_generator_module
from matching_engine import Availability, ExpertProfile, Location, ProblemInput, build_default_engine


def test_bounding_box_prefilter_reduces_distance_calculations(monkeypatch) -> None:
    call_count = {"value": 0}
    real_haversine = candidate_generator_module.haversine_km

    def tracked_haversine(a: Location, b: Location) -> float:
        call_count["value"] += 1
        return real_haversine(a, b)

    monkeypatch.setattr(candidate_generator_module, "haversine_km", tracked_haversine)

    experts = [
        ExpertProfile(
            expert_id="near-1",
            name="Near Expert",
            skills=["plumbing"],
            categories=["plumbing"],
            location=Location(latitude=40.7306, longitude=-73.9352),
            experience_years=5,
            availability=Availability(status="available", next_available_hours=0),
            rating=4.5,
        ),
        ExpertProfile(
            expert_id="far-1",
            name="Far Expert 1",
            skills=["plumbing"],
            categories=["plumbing"],
            location=Location(latitude=35.0000, longitude=-120.0000),
            experience_years=5,
            availability=Availability(status="available", next_available_hours=0),
            rating=4.2,
        ),
        ExpertProfile(
            expert_id="far-2",
            name="Far Expert 2",
            skills=["plumbing"],
            categories=["plumbing"],
            location=Location(latitude=48.8566, longitude=2.3522),
            experience_years=8,
            availability=Availability(status="available", next_available_hours=0),
            rating=4.9,
        ),
    ]

    engine = build_default_engine(enable_result_cache=False)
    problem = ProblemInput(
        text="Need urgent pipe leak repair",
        location=Location(latitude=40.7300, longitude=-73.9950),
        required_skills=["plumbing"],
        required_experience_years=2,
        max_radius_km=15.0,
    )

    response = engine.match(problem=problem, experts=experts, top_k=3)

    assert len(response.matches) == 1
    assert call_count["value"] < len(experts)


def test_repeated_query_uses_cached_result() -> None:
    experts = [
        ExpertProfile(
            expert_id="exp-1",
            name="Maria Lopez",
            skills=["plumbing", "leak detection"],
            categories=["plumbing"],
            location=Location(latitude=40.7306, longitude=-73.9352),
            experience_years=8,
            availability=Availability(status="available", next_available_hours=0),
            rating=4.8,
        )
    ]

    engine = build_default_engine(enable_result_cache=True)

    calls = {"value": 0}
    real_generate = engine._candidate_generator.generate

    def tracked_generate(problem: ProblemInput, experts_input):
        calls["value"] += 1
        return real_generate(problem, experts_input)

    engine._candidate_generator.generate = tracked_generate

    problem = ProblemInput(
        text="Need plumbing fix for leaking pipe",
        location=Location(latitude=40.7300, longitude=-73.9950),
        required_skills=["plumbing", "leak detection"],
        required_experience_years=3,
        max_radius_km=20.0,
    )

    first = engine.match(problem=problem, experts=experts, top_k=3)
    second = engine.match(problem=problem, experts=experts, top_k=3)

    assert calls["value"] == 1
    assert first.matches[0].expert_id == second.matches[0].expert_id
    assert first.matches[0].total_score == second.matches[0].total_score


def test_quadtree_spatial_index_backend_matches_successfully() -> None:
    experts = [
        ExpertProfile(
            expert_id="q-1",
            name="Quad Expert",
            skills=["plumbing", "leak detection"],
            categories=["plumbing"],
            location=Location(latitude=40.7306, longitude=-73.9352),
            experience_years=7,
            availability=Availability(status="available", next_available_hours=0),
            rating=4.7,
        ),
        ExpertProfile(
            expert_id="q-2",
            name="Far Quad Expert",
            skills=["plumbing"],
            categories=["plumbing"],
            location=Location(latitude=34.0522, longitude=-118.2437),
            experience_years=9,
            availability=Availability(status="available", next_available_hours=0),
            rating=4.6,
        ),
    ]

    engine = build_default_engine(
        enable_result_cache=False,
        spatial_index_threshold=1,
        spatial_index_backend="quadtree",
    )

    problem = ProblemInput(
        text="Need leak detection help",
        location=Location(latitude=40.7300, longitude=-73.9950),
        required_skills=["plumbing", "leak detection"],
        required_experience_years=2,
        max_radius_km=20.0,
    )

    response = engine.match(problem=problem, experts=experts, top_k=3)
    assert len(response.matches) == 1
    assert response.matches[0].expert_id == "q-1"
