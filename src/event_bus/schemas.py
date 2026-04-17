from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from typing import Any, Dict, List

from matching_engine.models import Location


@dataclass(frozen=True)
class RequestCreated:
    event_name: str
    request_id: str
    text: str
    location: Dict[str, float]
    required_skills: List[str]
    required_experience_years: int
    max_radius_km: float
    top_k: int
    occurred_at: str

    @staticmethod
    def from_payload(payload: Dict[str, Any]) -> "RequestCreated":
        return RequestCreated(
            event_name=payload["event_name"],
            request_id=payload["request_id"],
            text=payload["text"],
            location=payload["location"],
            required_skills=list(payload["required_skills"]),
            required_experience_years=int(payload["required_experience_years"]),
            max_radius_km=float(payload["max_radius_km"]),
            top_k=int(payload["top_k"]),
            occurred_at=payload["occurred_at"],
        )

    @staticmethod
    def build(
        request_id: str,
        text: str,
        location: Location,
        required_skills: List[str],
        required_experience_years: int,
        max_radius_km: float,
        top_k: int,
    ) -> "RequestCreated":
        return RequestCreated(
            event_name="RequestCreated",
            request_id=request_id,
            text=text,
            location={"latitude": location.latitude, "longitude": location.longitude},
            required_skills=required_skills,
            required_experience_years=required_experience_years,
            max_radius_km=max_radius_km,
            top_k=top_k,
            occurred_at=datetime.now(timezone.utc).isoformat(),
        )

    def to_payload(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass(frozen=True)
class MatchFound:
    event_name: str
    request_id: str
    categories: Dict[str, float]
    matches: List[Dict[str, Any]]
    occurred_at: str

    @staticmethod
    def build(
        request_id: str,
        categories: Dict[str, float],
        matches: List[Dict[str, Any]],
    ) -> "MatchFound":
        return MatchFound(
            event_name="MatchFound",
            request_id=request_id,
            categories=categories,
            matches=matches,
            occurred_at=datetime.now(timezone.utc).isoformat(),
        )

    @staticmethod
    def from_payload(payload: Dict[str, Any]) -> "MatchFound":
        return MatchFound(
            event_name=payload["event_name"],
            request_id=payload["request_id"],
            categories=dict(payload["categories"]),
            matches=list(payload["matches"]),
            occurred_at=payload["occurred_at"],
        )

    def to_payload(self) -> Dict[str, Any]:
        return asdict(self)
