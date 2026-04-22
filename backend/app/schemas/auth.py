from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


def _to_camel(value: str) -> str:
    parts = value.split("_")
    return parts[0] + "".join(part.capitalize() for part in parts[1:])


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=_to_camel, populate_by_name=True)


EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"


class RegisterUserRequest(CamelModel):
    full_name: str = Field(..., min_length=1, max_length=120)
    email: str = Field(..., pattern=EMAIL_PATTERN)
    password: str = Field(..., min_length=6, max_length=128)


class RegisterExpertRequest(CamelModel):
    full_name: str = Field(..., min_length=1, max_length=120)
    email: str = Field(..., pattern=EMAIL_PATTERN)
    password: str = Field(..., min_length=6, max_length=128)
    primary_expertise: str = Field(default="General Services", max_length=120)
    years_of_experience: int = Field(default=0, ge=0)
    expertise_areas: List[str] = Field(default_factory=list)
    bio: Optional[str] = Field(default=None, max_length=4000)
    available: bool = True
    serves_as_resident: bool = False
    city: Optional[str] = Field(default=None, max_length=120)
    latitude: Optional[float] = Field(default=None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(default=None, ge=-180.0, le=180.0)


class LoginRequest(CamelModel):
    email: str = Field(..., pattern=EMAIL_PATTERN)
    password: str = Field(..., min_length=1)


class AuthResponse(CamelModel):
    token: str
    full_name: str
    email: str
    role: str


class AuthProfile(CamelModel):
    full_name: str
    email: str
    role: str
    primary_expertise: Optional[str] = None
    years_of_experience: Optional[int] = None
    expertise_areas: List[str] = Field(default_factory=list)
    bio: Optional[str] = None
    available: Optional[bool] = None
    serves_as_resident: Optional[bool] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    region_bucket: Optional[str] = None
    shard_id: Optional[int] = None
    avg_rating: Optional[float] = None
    total_jobs: Optional[int] = None
    acceptance_rate: Optional[float] = None
    completion_rate: Optional[float] = None
    cancellation_rate: Optional[float] = None
    avg_response_time_sec: Optional[int] = None
