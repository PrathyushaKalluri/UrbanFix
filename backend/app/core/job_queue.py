from __future__ import annotations

import json
import queue
import threading
from dataclasses import dataclass
from typing import Callable, Dict, List, Optional

from .config import Settings


@dataclass(frozen=True)
class QueueMessage:
    message_id: str
    payload: Dict[str, str]


class JobQueue:
    def publish(self, payload: Dict[str, str]) -> str:
        raise NotImplementedError

    def consume_batch(self, batch_size: int, block_ms: int) -> List[QueueMessage]:
        raise NotImplementedError

    def ack(self, message_id: str) -> None:
        raise NotImplementedError

    def close(self) -> None:
        return None


class InMemoryJobQueue(JobQueue):
    def __init__(self) -> None:
        self._queue: queue.Queue[QueueMessage] = queue.Queue()
        self._sequence = 0
        self._lock = threading.Lock()

    def publish(self, payload: Dict[str, str]) -> str:
        with self._lock:
            self._sequence += 1
            message_id = str(self._sequence)
        self._queue.put(QueueMessage(message_id=message_id, payload=payload))
        return message_id

    def consume_batch(self, batch_size: int, block_ms: int) -> List[QueueMessage]:
        messages: List[QueueMessage] = []
        timeout_seconds = max(block_ms, 0) / 1000.0
        try:
            first = self._queue.get(timeout=timeout_seconds)
            messages.append(first)
        except queue.Empty:
            return messages

        for _ in range(max(batch_size - 1, 0)):
            try:
                messages.append(self._queue.get_nowait())
            except queue.Empty:
                break
        return messages

    def ack(self, message_id: str) -> None:
        return None


class RedisStreamsJobQueue(JobQueue):
    def __init__(
        self,
        *,
        redis_url: str,
        stream_name: str,
        group_name: str,
        consumer_name: str,
    ) -> None:
        try:
            import redis
        except ImportError as exc:
            raise RuntimeError("redis package is required for Redis Streams queue backend") from exc

        self._client = redis.Redis.from_url(redis_url, decode_responses=True)
        self._stream_name = stream_name
        self._group_name = group_name
        self._consumer_name = consumer_name
        self._ensure_group()

    def publish(self, payload: Dict[str, str]) -> str:
        serialized = {key: str(value) for key, value in payload.items()}
        return str(self._client.xadd(self._stream_name, serialized))

    def consume_batch(self, batch_size: int, block_ms: int) -> List[QueueMessage]:
        records = self._client.xreadgroup(
            groupname=self._group_name,
            consumername=self._consumer_name,
            streams={self._stream_name: ">"},
            count=max(batch_size, 1),
            block=max(block_ms, 0),
        )
        messages: List[QueueMessage] = []
        for _, entries in records:
            for message_id, payload in entries:
                messages.append(QueueMessage(message_id=str(message_id), payload={k: str(v) for k, v in payload.items()}))
        return messages

    def ack(self, message_id: str) -> None:
        self._client.xack(self._stream_name, self._group_name, message_id)

    def close(self) -> None:
        self._client.close()

    def _ensure_group(self) -> None:
        try:
            self._client.xgroup_create(self._stream_name, self._group_name, id="0", mkstream=True)
        except Exception as exc:
            if "BUSYGROUP" in str(exc):
                return
            raise


def create_job_queue(settings: Settings) -> JobQueue:
    if settings.queue_backend.lower() == "redis-streams":
        try:
            return RedisStreamsJobQueue(
                redis_url=settings.redis_url,
                stream_name=settings.queue_stream_name,
                group_name=settings.queue_consumer_group,
                consumer_name=settings.queue_consumer_name,
            )
        except Exception:
            return InMemoryJobQueue()
    return InMemoryJobQueue()


class QueueWorker:
    def __init__(
        self,
        *,
        queue_backend: JobQueue,
        handler: Callable[[Dict[str, str]], None],
        batch_size: int,
        poll_timeout_ms: int,
    ) -> None:
        self._queue = queue_backend
        self._handler = handler
        self._batch_size = max(batch_size, 1)
        self._poll_timeout_ms = max(poll_timeout_ms, 0)
        self._stop_event = threading.Event()
        self._thread = threading.Thread(target=self._loop, name="urbanfix-queue-worker", daemon=True)

    def start(self) -> None:
        if not self._thread.is_alive():
            self._thread.start()

    def stop(self) -> None:
        self._stop_event.set()
        self._thread.join(timeout=5)

    def _loop(self) -> None:
        while not self._stop_event.is_set():
            try:
                messages = self._queue.consume_batch(self._batch_size, self._poll_timeout_ms)
            except Exception:
                continue

            for message in messages:
                try:
                    self._handler(message.payload)
                    self._queue.ack(message.message_id)
                except Exception:
                    # Leave message unacked to allow replay/recovery.
                    continue
