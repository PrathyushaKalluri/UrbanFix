from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import Field

from .auth import CamelModel


class MatchingJobRequest(CamelModel):
    problem_text: str = Field(..., min_length=1)
    top_n: int = Field(default=5, ge=1, le=20)
    required_experience_years: Optional[int] = Field(default=None, ge=0)
    latitude: Optional[float] = Field(default=None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(default=None, ge=-180.0, le=180.0)
    radius_km: float = Field(default=15.0, ge=0.1, le=200.0)


class JobSubmissionResponse(CamelModel):
    job_id: str
    status: str
    job_type: str
    shard_id: Optional[int] = None
    region_bucket: Optional[str] = None


class JobStatusResponse(CamelModel):
    job_id: str
    job_type: str
    status: str
    payload: Dict[str, Any]
    result: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
