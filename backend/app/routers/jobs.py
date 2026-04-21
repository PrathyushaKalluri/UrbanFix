from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException, status

from ..core.config import settings
from ..schemas.job import JobStatusResponse, JobSubmissionResponse, MatchingJobRequest
from ..services.job_service import JobService
from .dependencies import (
    build_rate_limit_dependency,
    get_cache_dependency,
    get_current_user_dependency,
    get_job_queue_dependency,
    get_repository_dependency,
    get_shard_store_dependency,
    get_shard_router_dependency,
)

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.post(
    "/matching",
    response_model=JobSubmissionResponse,
    dependencies=[Depends(build_rate_limit_dependency("jobs.matching.submit", settings.job_rate_limit, settings.rate_limit_window_seconds))],
)
def submit_matching_job(
    payload: MatchingJobRequest,
    current_user=Depends(get_current_user_dependency),
    job_queue=Depends(get_job_queue_dependency),
    cache=Depends(get_cache_dependency),
    shard_store=Depends(get_shard_store_dependency),
    shard_router=Depends(get_shard_router_dependency),
) -> JobSubmissionResponse:
    service = JobService(shard_router, cache, shard_store)
    submission = service.submit_matching_job(current_user.user_id, payload.model_dump())
    job_queue.publish({"job_id": submission["job_id"], "job_type": submission["job_type"]})
    return JobSubmissionResponse(**submission)


@router.get("/{job_id}", response_model=JobStatusResponse)
def job_status(
    job_id: str,
    current_user=Depends(get_current_user_dependency),
    repository=Depends(get_repository_dependency),
) -> JobStatusResponse:
    job = repository.get_job(job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    if job.get("user_id") not in {None, current_user.user_id}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Job access denied")

    payload = job.get("payload_json") or "{}"
    result = job.get("result_json")
    return JobStatusResponse(
        job_id=job["job_id"],
        job_type=job["job_type"],
        status=job["status"],
        payload=json.loads(payload),
        result=json.loads(result) if result else None,
        error_message=job.get("error_message"),
        created_at=job["created_at"],
        updated_at=job["updated_at"],
    )
