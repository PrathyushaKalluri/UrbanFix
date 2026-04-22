from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ..core.config import settings
from ..db.repository import Repository
from ..schemas.expert import ExpertAvailabilityUpdate, ExpertDetail, ExpertListing, ExpertPage
from ..services.expert_service import ExpertService
from .dependencies import (
    build_rate_limit_dependency,
    get_cache_dependency,
    get_current_user_dependency,
    get_postgres_repository_dependency,
    get_shard_store_dependency,
    get_shard_router_dependency,
)

router = APIRouter(prefix="/api/experts", tags=["experts"])


@router.get("/all", response_model=list[ExpertListing], dependencies=[Depends(build_rate_limit_dependency("experts.list", settings.search_rate_limit, settings.rate_limit_window_seconds))])
def all_experts(
    available_only: bool = Query(default=False),
    repository: Repository = Depends(get_postgres_repository_dependency),
    shard_store=Depends(get_shard_store_dependency),
) -> list[ExpertListing]:
    service = ExpertService(repository, shard_store=shard_store)
    return [ExpertListing(**item) for item in service.list_experts(available_only=available_only)]


@router.get("/search", response_model=ExpertPage, dependencies=[Depends(build_rate_limit_dependency("experts.search", settings.search_rate_limit, settings.rate_limit_window_seconds))])
def search_experts(
    page: int = Query(default=1, ge=1, alias="page"),
    page_size: int = Query(default=settings.default_page_size, ge=1, alias="pageSize"),
    available_only: bool = Query(default=False, alias="availableOnly"),
    search: str | None = Query(default=None, max_length=200, alias="search"),
    primary_expertise: str | None = Query(default=None, max_length=120, alias="primaryExpertise"),
    expertise_area: str | None = Query(default=None, max_length=120, alias="expertiseArea"),
    serves_as_resident: bool | None = Query(default=None, alias="servesAsResident"),
    min_years_experience: int | None = Query(default=None, ge=0, alias="minYearsExperience"),
    max_years_experience: int | None = Query(default=None, ge=0, alias="maxYearsExperience"),
    latitude: float | None = Query(default=None, ge=-90.0, le=90.0, alias="latitude"),
    longitude: float | None = Query(default=None, ge=-180.0, le=180.0, alias="longitude"),
    radius_km: float = Query(default=15.0, ge=0.1, le=200.0, alias="radiusKm"),
    repository: Repository = Depends(get_postgres_repository_dependency),
    cache=Depends(get_cache_dependency),
    shard_store=Depends(get_shard_store_dependency),
    shard_router=Depends(get_shard_router_dependency),
) -> ExpertPage:
    bounded_page_size = min(page_size, settings.max_page_size)
    service = ExpertService(repository, cache, shard_router, shard_store)
    return ExpertPage(
        **service.search_experts(
            page=page,
            page_size=bounded_page_size,
            available_only=available_only,
            search=search,
            primary_expertise=primary_expertise,
            expertise_area=expertise_area,
            serves_as_resident=serves_as_resident,
            min_years_experience=min_years_experience,
            max_years_experience=max_years_experience,
            latitude=latitude,
            longitude=longitude,
            radius_km=radius_km,
        )
    )


@router.get("/{expert_id}", response_model=ExpertDetail)
def expert_detail(
    expert_id: int,
    repository: Repository = Depends(get_postgres_repository_dependency),
    shard_store=Depends(get_shard_store_dependency),
) -> ExpertDetail:
    service = ExpertService(repository, shard_store=shard_store)
    try:
        return ExpertDetail(**service.get_expert(expert_id))
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.patch("/me/availability", response_model=ExpertDetail)
def update_availability(
    payload: ExpertAvailabilityUpdate,
    current_user=Depends(get_current_user_dependency),
    repository: Repository = Depends(get_postgres_repository_dependency),
    shard_store=Depends(get_shard_store_dependency),
) -> ExpertDetail:
    if current_user.role != "EXPERT":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Expert role required")
    service = ExpertService(repository, shard_store=shard_store)
    try:
        return ExpertDetail(**service.update_availability(current_user.user_id, payload.available))
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
