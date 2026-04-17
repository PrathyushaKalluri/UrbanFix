from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Tuple


@dataclass(frozen=True)
class Location:
    latitude: float
    longitude: float


@dataclass(frozen=True)
class ProblemInput:
    text: str
    location: Location
    required_skills: List[str]
    required_experience_years: int
    max_radius_km: float


@dataclass(frozen=True)
class Availability:
    status: str
    next_available_hours: int


@dataclass(frozen=True)
class ExpertProfile:
    expert_id: str
    name: str
    skills: List[str]
    categories: List[str]
    location: Location
    experience_years: int
    availability: Availability
    rating: float


@dataclass(frozen=True)
class ScoreBreakdown:
    skill: float
    experience: float
    location: float
    availability: float
    rating: float


@dataclass(frozen=True)
class MatchResult:
    expert_id: str
    expert_name: str
    total_score: float
    breakdown: ScoreBreakdown


@dataclass(frozen=True)
class Candidate:
    expert: ExpertProfile
    distance_km: float
    skill_overlap: int


@dataclass(frozen=True)
class ClassificationResult:
    weighted_categories: Dict[str, float] = field(default_factory=dict)

    def top_categories(self, limit: int = 3) -> List[Tuple[str, float]]:
        ranked = sorted(self.weighted_categories.items(), key=lambda item: item[1], reverse=True)
        return ranked[:limit]
