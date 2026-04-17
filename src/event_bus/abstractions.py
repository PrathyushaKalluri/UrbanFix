from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


@dataclass(frozen=True)
class EventRecord:
    topic: str
    payload: Dict[str, Any]
    key: Optional[str]
    timestamp: datetime

    @staticmethod
    def create(topic: str, payload: Dict[str, Any], key: Optional[str] = None) -> "EventRecord":
        return EventRecord(
            topic=topic,
            payload=payload,
            key=key,
            timestamp=datetime.now(timezone.utc),
        )


class Producer(ABC):
    @abstractmethod
    def send(self, topic: str, payload: Dict[str, Any], key: Optional[str] = None) -> None:
        pass


class Consumer(ABC):
    @abstractmethod
    def subscribe(self, topics: List[str]) -> None:
        pass

    @abstractmethod
    def poll(self, max_messages: int = 10) -> List[EventRecord]:
        pass


class EventBus(ABC):
    @abstractmethod
    def producer(self) -> Producer:
        pass

    @abstractmethod
    def consumer(self, group_id: str) -> Consumer:
        pass
