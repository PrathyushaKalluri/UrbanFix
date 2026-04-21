from __future__ import annotations

from typing import List, Optional

from pydantic import ConfigDict

from .auth import CamelModel


class ExpertListing(CamelModel):
    expert_id: int
    user_id: int
    full_name: str
    primary_expertise: str
    years_of_experience: int
    bio: Optional[str] = None
    available: bool
    serves_as_resident: bool
    expertise_areas: List[str]


class ExpertAvailabilityUpdate(CamelModel):
    available: bool


class ExpertDetail(ExpertListing):
    model_config = ConfigDict(alias_generator=ExpertListing.model_config["alias_generator"], populate_by_name=True)
    email: str
    avg_rating: float = 0.0
    total_jobs: int = 0
    acceptance_rate: float = 0.0
    completion_rate: float = 0.0
    cancellation_rate: float = 0.0
    avg_response_time_sec: int = 0


class ExpertPage(CamelModel):
    items: List[ExpertListing]
    page: int
    page_size: int
    total_items: int
    total_pages: int
