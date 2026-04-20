from __future__ import annotations

from abc import ABC, abstractmethod


class ExpertResponseSimulator(ABC):
    """Returns whether a contacted expert accepts a routing request."""

    @abstractmethod
    def accepts(self, expert_id: str, rank: int) -> bool:
        pass
