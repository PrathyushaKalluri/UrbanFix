from __future__ import annotations

from datetime import datetime
from typing import Optional

from .auth import CamelModel


class ComponentHealth(CamelModel):
    status: str
    healthy: bool
    backend: Optional[str] = None
    details: Optional[str] = None


class HealthResponse(CamelModel):
    status: str
    app_name: str
    timestamp: datetime
    database: ComponentHealth
    cache: ComponentHealth
