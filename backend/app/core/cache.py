from __future__ import annotations

import json
import threading
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, Optional

from .config import Settings


class CacheProvider(ABC):
    @abstractmethod
    def get(self, key: str) -> Optional[Any]:
        raise NotImplementedError

    @abstractmethod
    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        raise NotImplementedError

    @abstractmethod
    def delete(self, key: str) -> None:
        raise NotImplementedError

    @abstractmethod
    def ping(self) -> bool:
        raise NotImplementedError

    def close(self) -> None:
        return None


@dataclass
class _CacheEntry:
    value: Any
    expires_at: float | None


class InMemoryCacheProvider(CacheProvider):
    def __init__(self) -> None:
        self._store: dict[str, _CacheEntry] = {}
        self._lock = threading.Lock()

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            entry = self._store.get(key)
            if entry is None:
                return None
            if entry.expires_at is not None and entry.expires_at <= time.time():
                self._store.pop(key, None)
                return None
            return entry.value

    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        expires_at = None if ttl_seconds is None else time.time() + max(ttl_seconds, 0)
        with self._lock:
            self._store[key] = _CacheEntry(value=value, expires_at=expires_at)

    def delete(self, key: str) -> None:
        with self._lock:
            self._store.pop(key, None)

    def ping(self) -> bool:
        return True


class RedisCacheProvider(CacheProvider):
    def __init__(self, redis_url: str, key_prefix: str = "urbanfix:") -> None:
        try:
            import redis
        except ImportError as exc:
            raise RuntimeError("redis package is required when CACHE_BACKEND=redis") from exc

        self._client = redis.Redis.from_url(redis_url, decode_responses=True)
        self._key_prefix = key_prefix
        self._fallback = InMemoryCacheProvider()

    def get(self, key: str) -> Optional[Any]:
        try:
            raw = self._client.get(self._key(key))
            if raw is None:
                return None
            try:
                return json.loads(raw)
            except json.JSONDecodeError:
                return None
        except Exception:
            return self._fallback.get(key)

    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        payload = json.dumps(value, default=str)
        redis_key = self._key(key)
        try:
            if ttl_seconds is None:
                self._client.set(redis_key, payload)
                return
            self._client.setex(redis_key, max(ttl_seconds, 0), payload)
        except Exception:
            self._fallback.set(key, value, ttl_seconds=ttl_seconds)

    def delete(self, key: str) -> None:
        try:
            self._client.delete(self._key(key))
        except Exception:
            self._fallback.delete(key)

    def ping(self) -> bool:
        try:
            return bool(self._client.ping())
        except Exception:
            return self._fallback.ping()

    def close(self) -> None:
        self._client.close()

    def _key(self, key: str) -> str:
        return f"{self._key_prefix}{key}"


def create_cache_provider(settings: Settings) -> CacheProvider:
    if settings.cache_backend.lower() == "redis":
        return RedisCacheProvider(redis_url=settings.redis_url, key_prefix=settings.redis_key_prefix)
    return InMemoryCacheProvider()
