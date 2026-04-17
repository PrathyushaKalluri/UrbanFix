from __future__ import annotations

import json
from typing import Dict, List, Optional

from .abstractions import Consumer, EventBus, EventRecord, Producer


class KafkaNotAvailableError(RuntimeError):
    pass


class KafkaEventBus(EventBus):
    """Thin Kafka abstraction.

    Uses kafka-python if installed. If unavailable, callers should fallback to InMemoryEventBus.
    """

    def __init__(self, bootstrap_servers: List[str]) -> None:
        try:
            from kafka import KafkaConsumer as _KafkaConsumer
            from kafka import KafkaProducer as _KafkaProducer
        except ImportError as exc:
            raise KafkaNotAvailableError(
                "kafka-python is not installed. Use InMemoryEventBus fallback."
            ) from exc

        self._producer_cls = _KafkaProducer
        self._consumer_cls = _KafkaConsumer
        self._bootstrap_servers = bootstrap_servers

    def producer(self) -> Producer:
        producer = self._producer_cls(
            bootstrap_servers=self._bootstrap_servers,
            value_serializer=lambda value: json.dumps(value).encode("utf-8"),
            key_serializer=lambda key: key.encode("utf-8") if key else None,
            acks="all",
        )
        return KafkaProducerAdapter(producer)

    def consumer(self, group_id: str) -> Consumer:
        consumer = self._consumer_cls(
            bootstrap_servers=self._bootstrap_servers,
            group_id=group_id,
            value_deserializer=lambda value: json.loads(value.decode("utf-8")),
            key_deserializer=lambda key: key.decode("utf-8") if key else None,
            auto_offset_reset="earliest",
            enable_auto_commit=True,
        )
        return KafkaConsumerAdapter(consumer)


class KafkaProducerAdapter(Producer):
    def __init__(self, producer) -> None:
        self._producer = producer

    def send(self, topic: str, payload: Dict, key: Optional[str] = None) -> None:
        self._producer.send(topic, value=payload, key=key)
        self._producer.flush()


class KafkaConsumerAdapter(Consumer):
    def __init__(self, consumer) -> None:
        self._consumer = consumer

    def subscribe(self, topics: List[str]) -> None:
        self._consumer.subscribe(topics)

    def poll(self, max_messages: int = 10) -> List[EventRecord]:
        polled = self._consumer.poll(timeout_ms=200, max_records=max_messages)
        records: List[EventRecord] = []

        for _, topic_records in polled.items():
            for item in topic_records:
                records.append(
                    EventRecord.create(
                        topic=item.topic,
                        payload=item.value,
                        key=item.key,
                    )
                )

        return records
