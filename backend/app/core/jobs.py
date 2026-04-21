from __future__ import annotations

import queue
import threading
import time
from dataclasses import dataclass
from typing import Callable, Optional


@dataclass(frozen=True)
class JobEnvelope:
    job_id: str


class BackgroundJobManager:
    def __init__(self, handler: Callable[[str], None]) -> None:
        self._handler = handler
        self._queue: queue.Queue[str] = queue.Queue()
        self._stop_event = threading.Event()
        self._thread = threading.Thread(target=self._run, name="urbanfix-job-worker", daemon=True)

    def start(self) -> None:
        if not self._thread.is_alive():
            self._thread.start()

    def stop(self) -> None:
        self._stop_event.set()
        self._queue.put("__stop__")
        self._thread.join(timeout=5)

    def submit(self, job_id: str) -> None:
        self._queue.put(job_id)

    def _run(self) -> None:
        while not self._stop_event.is_set():
            try:
                job_id = self._queue.get(timeout=0.5)
            except queue.Empty:
                continue

            if job_id == "__stop__":
                break

            try:
                self._handler(job_id)
            except Exception:
                pass
