from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional

from .auth import CamelModel


class NotificationItem(CamelModel):
    notification_id: int
    user_id: int
    channel: str
    title: str
    body: str
    payload: Dict[str, Any]
    is_read: bool
    created_at: datetime
    read_at: Optional[datetime] = None


class NotificationPage(CamelModel):
    items: list[NotificationItem]
