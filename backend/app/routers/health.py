from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from ..core.config import settings
from ..db.connection import db_session
from ..db.repository import Repository
from ..schemas.health import ComponentHealth, HealthResponse
from .dependencies import get_cache_dependency

router = APIRouter()


@router.get("/api/hello")
def hello() -> dict[str, str]:
    return {"message": "Hello from Python UrbanFix API"}


@router.get("/api/health/live", response_model=HealthResponse)
def live_health(cache=Depends(get_cache_dependency)) -> HealthResponse:
    return HealthResponse(
        status="ok",
        app_name=settings.app_name,
        timestamp=datetime.now(timezone.utc),
        database=ComponentHealth(status="ok", healthy=True, backend="sqlite"),
        cache=ComponentHealth(status="ok" if cache is not None else "disabled", healthy=cache is not None, backend=settings.cache_backend),
    )


@router.get("/api/health/ready", response_model=HealthResponse)
def ready_health(cache=Depends(get_cache_dependency)) -> HealthResponse:
    database_component = ComponentHealth(status="degraded", healthy=False, backend="sqlite")
    try:
        with db_session() as connection:
            repository = Repository(connection)
            row = repository.fetchone("SELECT 1 AS ok")
            if row is not None and int(row["ok"]) == 1:
                database_component = ComponentHealth(status="ok", healthy=True, backend="sqlite")
    except Exception as exc:
        database_component = ComponentHealth(status="error", healthy=False, backend="sqlite", details=str(exc))

    cache_component = ComponentHealth(status="disabled", healthy=True, backend=settings.cache_backend)
    if cache is not None:
        try:
            cache_ok = cache.ping()
            cache_component = ComponentHealth(
                status="ok" if cache_ok else "error",
                healthy=cache_ok,
                backend=settings.cache_backend,
                details=None if cache_ok else "cache ping failed",
            )
        except Exception as exc:
            cache_component = ComponentHealth(status="error", healthy=False, backend=settings.cache_backend, details=str(exc))

    ready = database_component.healthy and cache_component.healthy
    return HealthResponse(
        status="ready" if ready else "degraded",
        app_name=settings.app_name,
        timestamp=datetime.now(timezone.utc),
        database=database_component,
        cache=cache_component,
    )
