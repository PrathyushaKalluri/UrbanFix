from __future__ import annotations

import json
import uuid
from typing import Any, Dict, Optional

from ..core.config import settings
from ..core.sharding import SpatialShardRouter
from ..core.shard_store import ShardExpertStore
from ..db.connection import db_session
from ..db.repository import Repository
from .matching_service import MatchingService


class JobService:
    def __init__(self, shard_router: SpatialShardRouter, cache=None, shard_store: ShardExpertStore | None = None) -> None:
        self.shard_router = shard_router
        self.cache = cache
        self.shard_store = shard_store

    def submit_matching_job(self, user_id: int, payload: Dict[str, Any]) -> Dict[str, Any]:
        route = self._route_from_payload(payload)
        job_id = uuid.uuid4().hex
        with db_session() as connection:
            repository = Repository(connection)
            repository.create_job(
                job_id=job_id,
                job_type="matching.recommendations",
                status="QUEUED",
                user_id=user_id,
                payload=payload,
                region_bucket=route["region_bucket"],
                shard_id=route["shard_id"],
            )
        return {"job_id": job_id, "status": "QUEUED", "job_type": "matching.recommendations", **route}

    def process_queue_message(self, message_payload: Dict[str, str]) -> None:
        job_id = message_payload.get("job_id")
        if not job_id:
            return
        self.process_job(job_id)

    def process_job(self, job_id: str) -> None:
        with db_session() as connection:
            repository = Repository(connection)
            job = repository.get_job(job_id)
            if job is None or job["status"] not in {"QUEUED", "RETRY"}:
                return

            repository.update_job_status(job_id, "RUNNING")
            try:
                payload = json.loads(job["payload_json"])
                result = self._process_matching_job(repository, payload)
                repository.complete_job(job_id, result)
                repository.create_notification(
                    user_id=int(job["user_id"] or 0),
                    channel="IN_APP",
                    title="Matching recommendations ready",
                    body=f"Your request '{payload.get('problem_text', '')[:80]}' has completed.",
                    payload={"jobId": job_id, "result": result},
                )
            except Exception as exc:
                repository.fail_job(job_id, str(exc))

    def list_notifications(self, user_id: int) -> list[Dict[str, Any]]:
        with db_session() as connection:
            repository = Repository(connection)
            rows = repository.list_notifications(user_id)
            notifications: list[Dict[str, Any]] = []
            for row in rows:
                payload = json.loads(row["payload_json"]) if row.get("payload_json") else {}
                notifications.append({**row, "payload": payload})
            return notifications

    def get_job(self, job_id: str) -> Dict[str, Any] | None:
        with db_session() as connection:
            repository = Repository(connection)
            return repository.get_job(job_id)

    def _process_matching_job(self, repository: Repository, payload: Dict[str, Any]) -> Dict[str, Any]:
        service = MatchingService(repository, self.cache, self.shard_router, self.shard_store)
        return service.recommend(
            payload.get("problem_text", ""),
            payload.get("top_n", 5),
            payload.get("required_experience_years"),
            latitude=payload.get("latitude"),
            longitude=payload.get("longitude"),
            radius_km=payload.get("radius_km", 15.0),
        )

    def _route_from_payload(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        latitude = payload.get("latitude")
        longitude = payload.get("longitude")
        radius_km = float(payload.get("radius_km", 15.0))
        if latitude is None or longitude is None:
            return {"region_bucket": None, "shard_id": None}

        route = self.shard_router.route_for_point(float(latitude), float(longitude), radius_km=radius_km)
        return {"region_bucket": route.region_bucket, "shard_id": route.shard_id}