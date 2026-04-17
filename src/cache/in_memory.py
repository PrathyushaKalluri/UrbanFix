from __future__ import annotations

import threading
import time
from dataclasses import dataclass
from typing import Any, Dict, Optional

from .abstractions import CacheProvider


@dataclass
class CacheEntry:
    value: Any
    expires_at_epoch: Optional[float]


class InMemoryCacheProvider(CacheProvider):
    """Redis-compatible semantics for local development and tests.

    - set(key, value, ttl_seconds) supports TTL expiration.
    - get returns None for missing/expired keys.
    """

    def __init__(self) -> None:
        self._store: Dict[str, CacheEntry] = {}
        self._lock = threading.Lock()

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            entry = self._store.get(key)
            if not entry:
                return None
            if self._is_expired(entry):
                del self._store[key]
                return None
            return entry.value

    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        expires_at = None
        if ttl_seconds is not None:
            expires_at = time.time() + max(ttl_seconds, 0)

        with self._lock:
            self._store[key] = CacheEntry(value=value, expires_at_epoch=expires_at)

    def delete(self, key: str) -> None:
        with self._lock:
            self._store.pop(key, None)

    def exists(self, key: str) -> bool:
        return self.get(key) is not None

    @staticmethod
    def _is_expired(entry: CacheEntry) -> bool:
        if entry.expires_at_epoch is None:
            return False
        return time.time() > entry.expires_at_epoch
