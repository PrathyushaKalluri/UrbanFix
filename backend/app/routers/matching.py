from __future__ import annotations

from fastapi import APIRouter, Depends

from ..core.config import settings
from ..db.repository import Repository
from ..schemas.matching import MatchRequest, MatchResponse
from ..services.matching_service import MatchingService
from .dependencies import (
    build_rate_limit_dependency,
    get_cache_dependency,
    get_repository_dependency,
    get_shard_router_dependency,
    get_shard_store_dependency,
)

router = APIRouter(prefix="/api/matching", tags=["matching"])


@router.post("/recommendations", response_model=MatchResponse, dependencies=[Depends(build_rate_limit_dependency("matching.recommendations", settings.match_rate_limit, settings.rate_limit_window_seconds))])
def recommendations(
    payload: MatchRequest,
    repository: Repository = Depends(get_repository_dependency),
    cache=Depends(get_cache_dependency),
    shard_store=Depends(get_shard_store_dependency),
    shard_router=Depends(get_shard_router_dependency),
) -> MatchResponse:
    service = MatchingService(repository, cache, shard_router, shard_store)
    result = service.recommend(
        payload.problem_text,
        payload.top_n,
        payload.required_experience_years,
        latitude=payload.latitude,
        longitude=payload.longitude,
        radius_km=payload.radius_km,
    )
    return MatchResponse(**result)


@router.post("/cached-recommendations", response_model=MatchResponse, dependencies=[Depends(build_rate_limit_dependency("matching.cached", settings.match_rate_limit, settings.rate_limit_window_seconds))])
def cached_recommendations(
    payload: MatchRequest,
    repository: Repository = Depends(get_repository_dependency),
    cache=Depends(get_cache_dependency),
    shard_store=Depends(get_shard_store_dependency),
    shard_router=Depends(get_shard_router_dependency),
) -> MatchResponse:
    service = MatchingService(repository, cache, shard_router, shard_store)
    result = service.recommend(
        payload.problem_text,
        payload.top_n,
        payload.required_experience_years,
        latitude=payload.latitude,
        longitude=payload.longitude,
        radius_km=payload.radius_km,
    )
    return MatchResponse(**result)
