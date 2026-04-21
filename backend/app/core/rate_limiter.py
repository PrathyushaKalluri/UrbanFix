from __future__ import annotations

import threading
import time
from dataclasses import dataclass
from typing import Callable, Optional

from fastapi import Depends, HTTPException, Request, status

from .config import Settings


@dataclass(frozen=True)
class RateLimitResult:
    allowed: bool
    limit: int
    remaining: int
    reset_after_seconds: int


class RequestRateLimiter:
    def allow(self, scope: str, identifier: str, limit: int, window_seconds: int) -> RateLimitResult:
        raise NotImplementedError

    def dependency(self, scope: str, limit: int, window_seconds: int) -> Callable[[Request], None]:
        async def _dependency(request: Request) -> None:
            identifier = self._identifier(request)
            result = self.allow(scope, identifier, limit, window_seconds)
            if not result.allowed:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail={
                        "message": "Rate limit exceeded",
                        "scope": scope,
                        "limit": result.limit,
                        "remaining": result.remaining,
                        "retryAfterSeconds": result.reset_after_seconds,
                    },
                    headers={"Retry-After": str(result.reset_after_seconds)},
                )

        return _dependency

    def _identifier(self, request: Request) -> str:
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            first_hop = forwarded_for.split(",")[0].strip()
            if first_hop:
                return first_hop
        if request.client and request.client.host:
            return request.client.host
        return "unknown"


class InMemoryRateLimiter(RequestRateLimiter):
    def __init__(self) -> None:
        self._store: dict[str, tuple[int, int]] = {}
        self._lock = threading.Lock()

    def allow(self, scope: str, identifier: str, limit: int, window_seconds: int) -> RateLimitResult:
        window_seconds = max(window_seconds, 1)
        key = self._key(scope, identifier, window_seconds)
        now = int(time.time())
        current_window_start = now - (now % window_seconds)

        with self._lock:
            stored_window, count = self._store.get(key, (current_window_start, 0))
            if stored_window != current_window_start:
                stored_window = current_window_start
                count = 0
            count += 1
            self._store[key] = (stored_window, count)

        allowed = count <= limit
        remaining = max(limit - count, 0)
        reset_after = window_seconds - (now - current_window_start)
        return RateLimitResult(allowed=allowed, limit=limit, remaining=remaining, reset_after_seconds=max(reset_after, 1))

    def _key(self, scope: str, identifier: str, window_seconds: int) -> str:
        return f"{scope}:{identifier}:{window_seconds}"


class RedisRateLimiter(RequestRateLimiter):
    def __init__(self, redis_url: str, key_prefix: str = "urbanfix:ratelimit:") -> None:
        try:
            import redis
        except ImportError as exc:
            raise RuntimeError("redis package is required when RATE_LIMIT_BACKEND=redis") from exc

        self._client = redis.Redis.from_url(redis_url, decode_responses=True)
        self._key_prefix = key_prefix
        self._fallback = InMemoryRateLimiter()

    def allow(self, scope: str, identifier: str, limit: int, window_seconds: int) -> RateLimitResult:
        window_seconds = max(window_seconds, 1)
        now = int(time.time())
        window_key = now - (now % window_seconds)
        key = f"{self._key_prefix}{scope}:{identifier}:{window_key}"

        try:
            count = self._client.incr(key)
            if count == 1:
                self._client.expire(key, window_seconds)

            ttl = self._client.ttl(key)
            reset_after = ttl if isinstance(ttl, int) and ttl > 0 else window_seconds
            allowed = count <= limit
            remaining = max(limit - count, 0)
            return RateLimitResult(allowed=allowed, limit=limit, remaining=remaining, reset_after_seconds=reset_after)
        except Exception:
            return self._fallback.allow(scope, identifier, limit, window_seconds)


def create_rate_limiter(settings: Settings) -> RequestRateLimiter:
    if settings.rate_limit_backend.lower() == "redis":
        return RedisRateLimiter(redis_url=settings.redis_url)
    return InMemoryRateLimiter()