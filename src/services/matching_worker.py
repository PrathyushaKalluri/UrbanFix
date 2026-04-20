from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional

from event_bus.abstractions import Consumer, Producer
from event_bus.schemas import AssignmentCreated, MatchFound, RequestCreated
from matching_engine.engine import MatchingEngine
from matching_engine.models import ExpertProfile, Location, ProblemInput
from routing_engine import ExpertResponseSimulator, RoutingEngine


@dataclass
class MatchingWorker:
    consumer: Consumer
    producer: Producer
    engine: MatchingEngine
    experts: List[ExpertProfile]
    routing_engine: Optional[RoutingEngine] = None
    response_simulator: Optional[ExpertResponseSimulator] = None

    def start(self) -> None:
        self.consumer.subscribe(["requests"])

    def process_once(self) -> int:
        records = self.consumer.poll(max_messages=10)
        processed = 0

        for record in records:
            if record.topic != "requests":
                continue

            request_event = RequestCreated.from_payload(record.payload)
            problem = ProblemInput(
                text=request_event.text,
                location=Location(
                    latitude=request_event.location["latitude"],
                    longitude=request_event.location["longitude"],
                ),
                required_skills=request_event.required_skills,
                required_experience_years=request_event.required_experience_years,
                max_radius_km=request_event.max_radius_km,
            )

            response = self.engine.match(problem=problem, experts=self.experts, top_k=request_event.top_k)

            match_payload = MatchFound.build(
                request_id=request_event.request_id,
                categories=response.categories.weighted_categories,
                matches=[
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
            )

            self.producer.send(
                topic="matches",
                payload=match_payload.to_payload(),
                key=request_event.request_id,
            )

            if self.routing_engine is not None and self.response_simulator is not None:
                routing_result = self.routing_engine.route(
                    ranked_experts=response.matches,
                    simulator=self.response_simulator,
                )
                assignment_payload = AssignmentCreated.build(
                    request_id=request_event.request_id,
                    assigned_expert_id=routing_result.assigned_expert_id,
                    assigned_expert_name=routing_result.assigned_expert_name,
                    contacted_expert_ids=routing_result.contacted_expert_ids,
                    rejected_expert_ids=routing_result.rejected_expert_ids,
                    cancelled_expert_ids=routing_result.cancelled_expert_ids,
                    attempts=[
                        {
                            "expert_id": attempt.expert_id,
                            "expert_name": attempt.expert_name,
                            "rank": attempt.rank,
                            "accepted": attempt.accepted,
                        }
                        for attempt in routing_result.attempts
                    ],
                )
                self.producer.send(
                    topic="assignments",
                    payload=assignment_payload.to_payload(),
                    key=request_event.request_id,
                )
            processed += 1

        return processed
