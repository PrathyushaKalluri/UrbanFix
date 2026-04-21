from __future__ import annotations

from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class CurrentUser:
    user_id: int
    full_name: str
    email: str
    role: str
    bio: Optional[str] = None
