from __future__ import annotations

from typing import Generator

from fastapi import Depends, Header, HTTPException, Request, status

from ..core.config import settings
from ..core.job_queue import JobQueue, create_job_queue
from ..core.rate_limiter import create_rate_limiter
from ..core.rate_limiter import RequestRateLimiter
from ..core.sharding import SpatialShardRouter
from ..core.shard_store import ShardExpertStore
from ..core.security import decode_token
from ..db.connection import db_session
from ..db.repository import Repository
from ..models.entities import CurrentUser
from ..core.cache import CacheProvider


def get_repository_dependency() -> Repository:
    with db_session() as connection:
        yield Repository(connection)


def get_cache_dependency(request: Request) -> CacheProvider | None:
    cache = getattr(request.app.state, "cache_provider", None)
    if cache is None:
        from ..core.cache import create_cache_provider

        cache = create_cache_provider(settings)
        request.app.state.cache_provider = cache
    return cache


def get_rate_limiter_dependency(request: Request) -> RequestRateLimiter | None:
    limiter = getattr(request.app.state, "rate_limiter", None)
    if limiter is None:
        limiter = create_rate_limiter(settings)
        request.app.state.rate_limiter = limiter
    return limiter


def get_shard_router_dependency(request: Request) -> SpatialShardRouter:
    router = getattr(request.app.state, "shard_router", None)
    if router is None:
        router = SpatialShardRouter(settings.shard_count, settings.shard_cell_degrees)
        request.app.state.shard_router = router
    return router


def get_job_queue_dependency(request: Request) -> JobQueue:
    queue = getattr(request.app.state, "job_queue", None)
    if queue is None:
        queue = create_job_queue(settings)
        request.app.state.job_queue = queue
    return queue


def get_shard_store_dependency(request: Request) -> ShardExpertStore:
    store = getattr(request.app.state, "shard_store", None)
    if store is None:
        store = ShardExpertStore(shard_count=settings.shard_count, shard_db_directory=settings.shard_db_directory)
        store.initialize()
        request.app.state.shard_store = store
    return store


def build_rate_limit_dependency(scope: str, limit: int, window_seconds: int):
    async def dependency(request: Request, rate_limiter: RequestRateLimiter | None = Depends(get_rate_limiter_dependency)) -> None:
        if rate_limiter is None:
            return None
        return await rate_limiter.dependency(scope, limit, window_seconds)(request)

    return dependency


def get_current_user_dependency(authorization: str | None = Header(default=None)) -> CurrentUser:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")

    token = authorization.removeprefix("Bearer ").strip()
    try:
        payload = decode_token(token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

    subject = payload.get("sub")
    if not subject:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")

    return CurrentUser(
        user_id=int(subject),
        full_name=payload.get("full_name", ""),
        email=payload.get("email", ""),
        role=payload.get("role", "USER"),
    )
