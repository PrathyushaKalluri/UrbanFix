from __future__ import annotations

from typing import List, Optional

from .abstractions import EventBus
from .in_memory import InMemoryEventBus
from .kafka import KafkaEventBus, KafkaNotAvailableError


def build_event_bus(
    prefer_kafka: bool,
    bootstrap_servers: Optional[List[str]] = None,
) -> EventBus:
    if not prefer_kafka:
        return InMemoryEventBus()

    if not bootstrap_servers:
        return InMemoryEventBus()

    try:
        return KafkaEventBus(bootstrap_servers=bootstrap_servers)
    except KafkaNotAvailableError:
        return InMemoryEventBus()
