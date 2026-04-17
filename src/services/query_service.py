from __future__ import annotations

from dataclasses import dataclass
from uuid import uuid4

from event_bus.abstractions import Producer
from event_bus.schemas import RequestCreated
from matching_engine.models import Location, ProblemInput


@dataclass
class QueryService:
    producer: Producer

    def create_request(self, problem: ProblemInput, top_k: int = 5) -> str:
        request_id = str(uuid4())
        event = RequestCreated.build(
            request_id=request_id,
            text=problem.text,
            location=Location(
                latitude=problem.location.latitude,
                longitude=problem.location.longitude,
            ),
            required_skills=problem.required_skills,
            required_experience_years=problem.required_experience_years,
            max_radius_km=problem.max_radius_km,
            top_k=top_k,
        )
        self.producer.send(topic="requests", payload=event.to_payload(), key=request_id)
        return request_id
