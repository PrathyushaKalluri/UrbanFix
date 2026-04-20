from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1] / "src"))

from event_bus.factory import build_event_bus
from event_bus.schemas import AssignmentCreated
from matching_engine import Availability, ExpertProfile, Location, ProblemInput, build_default_engine
from routing_engine import DeterministicResponseSimulator, RoutingEngine
from services import MatchingWorker, NotificationWorker, QueryService


def sample_experts() -> list[ExpertProfile]:
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


def main() -> None:
    # prefer_kafka=True will still fallback to in-memory queue if Kafka is unavailable.
    bus = build_event_bus(prefer_kafka=True, bootstrap_servers=["localhost:9092"])

    query_service = QueryService(producer=bus.producer())
    matching_worker = MatchingWorker(
        consumer=bus.consumer(group_id="matching-engine"),
        producer=bus.producer(),
        engine=build_default_engine(),
        experts=sample_experts(),
        routing_engine=RoutingEngine(max_experts_to_route=3),
        response_simulator=DeterministicResponseSimulator(
            {
                "exp-001": False,
                "exp-002": True,
            }
        ),
    )
    notification_worker = NotificationWorker(consumer=bus.consumer(group_id="notifications"))
    assignments_consumer = bus.consumer(group_id="assignments-reader")

    matching_worker.start()
    notification_worker.start()
    assignments_consumer.subscribe(["assignments"])

    request_id = query_service.create_request(
        ProblemInput(
            text="Need a plumber for leaking sink and repainting a small wall patch",
            location=Location(latitude=40.7300, longitude=-73.9950),
            required_skills=["plumbing", "leak detection", "painting"],
            required_experience_years=3,
            max_radius_km=20.0,
        ),
        top_k=3,
    )

    matching_worker.process_once()
    notification_worker.process_once()
    assignment_records = assignments_consumer.poll(max_messages=5)
    assignments = [AssignmentCreated.from_payload(record.payload) for record in assignment_records]

    output = {
        "request_id": request_id,
        "notifications": notification_worker.sent_notifications,
        "assignments": [
            {
                "request_id": event.request_id,
                "assigned_expert_id": event.assigned_expert_id,
                "assigned_expert_name": event.assigned_expert_name,
                "contacted_expert_ids": event.contacted_expert_ids,
                "rejected_expert_ids": event.rejected_expert_ids,
                "cancelled_expert_ids": event.cancelled_expert_ids,
            }
            for event in assignments
        ],
    }
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
