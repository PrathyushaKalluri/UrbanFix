from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List

from event_bus.abstractions import Consumer
from event_bus.schemas import MatchFound


@dataclass
class NotificationWorker:
    consumer: Consumer
    sent_notifications: List[Dict] = field(default_factory=list)

    def start(self) -> None:
        self.consumer.subscribe(["matches"])

    def process_once(self) -> int:
        records = self.consumer.poll(max_messages=10)
        processed = 0

        for record in records:
            if record.topic != "matches":
                continue

            event = MatchFound.from_payload(record.payload)
            self.sent_notifications.append(
                {
                    "request_id": event.request_id,
                    "match_count": len(event.matches),
                    "top_expert": event.matches[0]["expert_name"] if event.matches else None,
                }
            )
            processed += 1

        return processed
