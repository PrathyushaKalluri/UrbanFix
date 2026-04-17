from __future__ import annotations

import json
from typing import Any, Optional

from .abstractions import CacheProvider


class RedisCacheProvider(CacheProvider):
    """Redis-backed cache provider compatible with CacheProvider.

    Values are serialized as JSON. Use this provider for shared, production-grade caching.
    """

    def __init__(self, redis_url: str = "redis://localhost:6379/0", key_prefix: str = "urbanfix:") -> None:
        try:
            import redis
        except ImportError as exc:
            raise RuntimeError(
                "redis package is required for RedisCacheProvider. Install with: pip install redis"
            ) from exc

        self._client = redis.Redis.from_url(redis_url, decode_responses=True)
        self._key_prefix = key_prefix

    def get(self, key: str) -> Optional[Any]:
        raw = self._client.get(self._key(key))
        if raw is None:
            return None
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return None

    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        payload = json.dumps(value)
        namespaced = self._key(key)
        if ttl_seconds is None:
            self._client.set(namespaced, payload)
            return
        self._client.setex(namespaced, max(ttl_seconds, 0), payload)

    def delete(self, key: str) -> None:
        self._client.delete(self._key(key))

    def exists(self, key: str) -> bool:
        return bool(self._client.exists(self._key(key)))

    def ping(self) -> bool:
        return bool(self._client.ping())

    def _key(self, key: str) -> str:
        return f"{self._key_prefix}{key}"
