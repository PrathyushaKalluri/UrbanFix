from __future__ import annotations

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1] / "src"))

from event_bus.factory import build_event_bus
from event_bus.schemas import AssignmentCreated
from matching_engine import Availability, ExpertProfile, Location, ProblemInput, build_default_engine
from routing_engine import DeterministicResponseSimulator, RoutingEngine
from services import MatchingWorker, NotificationWorker, QueryService


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
            name="Ava Chen",
            skills=["plumbing", "faucet install", "painting"],
            categories=["plumbing", "painting"],
            location=Location(latitude=40.7128, longitude=-74.0060),
            experience_years=4,
            availability=Availability(status="available", next_available_hours=0),
            rating=4.2,
        ),
    ]


def test_event_driven_request_to_notification_flow() -> None:
    bus = build_event_bus(prefer_kafka=False)

    query_service = QueryService(producer=bus.producer())
    matching_worker = MatchingWorker(
        consumer=bus.consumer(group_id="matching-engine"),
        producer=bus.producer(),
        engine=build_default_engine(),
        experts=_experts(),
    )
    notification_worker = NotificationWorker(consumer=bus.consumer(group_id="notifications"))

    matching_worker.start()
    notification_worker.start()

    request_id = query_service.create_request(
        ProblemInput(
            text="Need plumbing fix for leaking pipe",
            location=Location(latitude=40.7300, longitude=-73.9950),
            required_skills=["plumbing", "leak detection"],
            required_experience_years=3,
            max_radius_km=20.0,
        ),
        top_k=3,
    )

    assert matching_worker.process_once() == 1
    assert notification_worker.process_once() == 1

    assert len(notification_worker.sent_notifications) == 1
    payload = notification_worker.sent_notifications[0]
    assert payload["request_id"] == request_id
    assert payload["match_count"] >= 1


def test_event_driven_request_to_assignment_flow() -> None:
    bus = build_event_bus(prefer_kafka=False)

    query_service = QueryService(producer=bus.producer())
    matching_worker = MatchingWorker(
        consumer=bus.consumer(group_id="matching-engine"),
        producer=bus.producer(),
        engine=build_default_engine(),
        experts=_experts(),
        routing_engine=RoutingEngine(max_experts_to_route=3),
        response_simulator=DeterministicResponseSimulator(
            {
                "exp-001": False,
                "exp-002": True,
            }
        ),
    )
    assignments_consumer = bus.consumer(group_id="assignments-reader")

    matching_worker.start()
    assignments_consumer.subscribe(["assignments"])

    request_id = query_service.create_request(
        ProblemInput(
            text="Need plumbing fix for leaking pipe",
            location=Location(latitude=40.7300, longitude=-73.9950),
            required_skills=["plumbing", "leak detection"],
            required_experience_years=3,
            max_radius_km=20.0,
        ),
        top_k=3,
    )

    assert matching_worker.process_once() == 1

    assignment_records = assignments_consumer.poll(max_messages=5)
    assert len(assignment_records) == 1

    assignment_event = AssignmentCreated.from_payload(assignment_records[0].payload)
    assert assignment_event.request_id == request_id
    assert assignment_event.assigned_expert_id == "exp-002"
    assert assignment_event.contacted_expert_ids == ["exp-001", "exp-002"]
    assert assignment_event.rejected_expert_ids == ["exp-001"]
