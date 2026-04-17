from __future__ import annotations

from dataclasses import dataclass
from typing import List

from event_bus.abstractions import Consumer, Producer
from event_bus.schemas import MatchFound, RequestCreated
from matching_engine.engine import MatchingEngine
from matching_engine.models import ExpertProfile, Location, ProblemInput


@dataclass
class MatchingWorker:
    consumer: Consumer
    producer: Producer
    engine: MatchingEngine
    experts: List[ExpertProfile]

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
            processed += 1

        return processed
