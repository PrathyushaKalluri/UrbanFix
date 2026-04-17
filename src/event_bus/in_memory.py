from __future__ import annotations

from collections import defaultdict
from threading import Lock
from typing import Dict, List, Optional, Set

from .abstractions import Consumer, EventBus, EventRecord, Producer


class InMemoryEventBus(EventBus):
    """In-memory queue with per-topic logs and consumer-group offsets.

    This simulates pub/sub behavior when Kafka is unavailable.
    """

    def __init__(self) -> None:
        self._topics: Dict[str, List[EventRecord]] = defaultdict(list)
        self._offsets: Dict[str, Dict[str, int]] = defaultdict(dict)
        self._lock = Lock()

    def producer(self) -> Producer:
        return InMemoryProducer(self)

    def consumer(self, group_id: str) -> Consumer:
        return InMemoryConsumer(self, group_id)

    def append(self, topic: str, record: EventRecord) -> None:
        with self._lock:
            self._topics[topic].append(record)

    def read(self, group_id: str, topic: str, max_messages: int) -> List[EventRecord]:
        with self._lock:
            start = self._offsets[group_id].get(topic, 0)
            records = self._topics.get(topic, [])
            if start >= len(records):
                return []

            end = min(start + max_messages, len(records))
            batch = records[start:end]
            self._offsets[group_id][topic] = end
            return batch


class InMemoryProducer(Producer):
    def __init__(self, bus: InMemoryEventBus) -> None:
        self._bus = bus

    def send(self, topic: str, payload: dict, key: Optional[str] = None) -> None:
        self._bus.append(topic, EventRecord.create(topic=topic, payload=payload, key=key))


class InMemoryConsumer(Consumer):
    def __init__(self, bus: InMemoryEventBus, group_id: str) -> None:
        self._bus = bus
        self._group_id = group_id
        self._topics: Set[str] = set()

    def subscribe(self, topics: List[str]) -> None:
        self._topics = set(topics)

    def poll(self, max_messages: int = 10) -> List[EventRecord]:
        if not self._topics:
            return []

        collected: List[EventRecord] = []
        per_topic = max(1, max_messages // len(self._topics))
        for topic in sorted(self._topics):
            collected.extend(self._bus.read(self._group_id, topic, per_topic))
            if len(collected) >= max_messages:
                return collected[:max_messages]

        return collected
