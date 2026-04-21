from __future__ import annotations

from typing import List, Optional

from pydantic import Field

from .auth import CamelModel


class MatchRequest(CamelModel):
    problem_text: str = Field(..., min_length=1)
    top_n: int = Field(default=5, ge=1, le=20)
    required_experience_years: Optional[int] = Field(default=None, ge=0)
    latitude: Optional[float] = Field(default=None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(default=None, ge=-180.0, le=180.0)
    radius_km: float = Field(default=15.0, ge=0.1, le=200.0)


class MatchBreakdown(CamelModel):
    skill: float
    experience: float
    availability: float
    reputation: float
    response: float


class MatchSuggestion(CamelModel):
    expert_id: int
    full_name: str
    primary_expertise: str
    score: float
    breakdown: MatchBreakdown
    reasons: List[str]


class MatchResponse(CamelModel):
    request_text: str
    suggestions: List[MatchSuggestion]
