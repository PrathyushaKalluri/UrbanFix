from __future__ import annotations

from fastapi import APIRouter, Depends, Header, HTTPException, status

from ..db.postgres_repository import PostgresRepository
from ..schemas.auth import AuthProfile, AuthResponse, LoginRequest, RegisterExpertRequest, RegisterUserRequest
from ..schemas.expert import ExpertAvailabilityUpdate
from ..services.postgres_auth_service import PostgresAuthService
from .dependencies import (
    build_rate_limit_dependency,
    get_current_user_dependency,
    get_postgres_repository_dependency,
    get_shard_store_dependency,
    get_shard_router_dependency,
)
from ..core.config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register/user", response_model=AuthResponse, dependencies=[Depends(build_rate_limit_dependency("auth.register.user", settings.register_rate_limit, settings.rate_limit_window_seconds))])
def register_user(payload: RegisterUserRequest, repository: PostgresRepository = Depends(get_postgres_repository_dependency)) -> AuthResponse:
    service = PostgresAuthService(repository)
    try:
        result = service.register_user(payload.full_name, payload.email, payload.password)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return AuthResponse(**result)


@router.post("/register/expert", response_model=AuthResponse, dependencies=[Depends(build_rate_limit_dependency("auth.register.expert", settings.register_rate_limit, settings.rate_limit_window_seconds))])
def register_expert(
    payload: RegisterExpertRequest,
    repository: PostgresRepository = Depends(get_postgres_repository_dependency),
    shard_router=Depends(get_shard_router_dependency),
    shard_store=Depends(get_shard_store_dependency),
) -> AuthResponse:
    service = PostgresAuthService(repository, shard_router, shard_store)
    try:
        result = service.register_expert(
            payload.full_name,
            payload.email,
            payload.password,
            payload.primary_expertise,
            payload.years_of_experience,
            payload.expertise_areas,
            payload.bio,
            payload.available,
            payload.serves_as_resident,
            payload.city,
            payload.latitude,
            payload.longitude,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return AuthResponse(**result)


@router.post("/login", response_model=AuthResponse, dependencies=[Depends(build_rate_limit_dependency("auth.login", settings.login_rate_limit, settings.rate_limit_window_seconds))])
def login(payload: LoginRequest, repository: PostgresRepository = Depends(get_postgres_repository_dependency)) -> AuthResponse:
    service = PostgresAuthService(repository)
    try:
        result = service.login(payload.email, payload.password)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc
    return AuthResponse(**result)


@router.get("/me", response_model=AuthProfile)
def me(current_user = Depends(get_current_user_dependency), repository: PostgresRepository = Depends(get_postgres_repository_dependency)) -> AuthProfile:
    service = PostgresAuthService(repository)
    try:
        result = service.current_user_profile(current_user.user_id)
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return AuthProfile(**result)


@router.patch("/me/availability", response_model=AuthProfile)
def update_availability(
    payload: ExpertAvailabilityUpdate,
    current_user=Depends(get_current_user_dependency),
    repository: PostgresRepository = Depends(get_postgres_repository_dependency),
    shard_router=Depends(get_shard_router_dependency),
    shard_store=Depends(get_shard_store_dependency),
) -> AuthProfile:
    if current_user.role != "EXPERT":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Expert role required")
    service = PostgresAuthService(repository, shard_router, shard_store)
    try:
        result = service.update_expert_availability(current_user.user_id, payload.available)
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    return AuthProfile(**result)
