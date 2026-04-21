from __future__ import annotations

import json
import sqlite3
from hashlib import sha256
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Sequence


class ShardExpertStore:
    def __init__(self, *, shard_count: int, shard_db_directory: str) -> None:
        self.shard_count = max(1, shard_count)
        self.base_dir = Path(shard_db_directory)

    def initialize(self) -> None:
        self.base_dir.mkdir(parents=True, exist_ok=True)
        for shard_id in range(self.shard_count):
            with self._connect(shard_id) as connection:
                connection.execute(
                    """
                    CREATE TABLE IF NOT EXISTS expert_directory (
                      expert_id INTEGER PRIMARY KEY,
                      user_id INTEGER NOT NULL,
                      full_name TEXT NOT NULL,
                      email TEXT NOT NULL,
                      primary_expertise TEXT NOT NULL,
                      years_of_experience INTEGER NOT NULL,
                      bio TEXT,
                      available INTEGER NOT NULL,
                      serves_as_resident INTEGER NOT NULL,
                      expertise_areas_json TEXT NOT NULL,
                      avg_rating REAL NOT NULL,
                      total_jobs INTEGER NOT NULL,
                      acceptance_rate REAL NOT NULL,
                      completion_rate REAL NOT NULL,
                      cancellation_rate REAL NOT NULL,
                      avg_response_time_sec INTEGER NOT NULL,
                      latitude REAL,
                      longitude REAL,
                      city TEXT,
                      region_bucket TEXT,
                      shard_id INTEGER,
                      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                    )
                    """
                )
                connection.execute("CREATE INDEX IF NOT EXISTS idx_expert_directory_available ON expert_directory(available)")
                connection.execute("CREATE INDEX IF NOT EXISTS idx_expert_directory_experience ON expert_directory(years_of_experience DESC)")
                connection.execute("CREATE INDEX IF NOT EXISTS idx_expert_directory_region_bucket ON expert_directory(region_bucket)")
                connection.execute("CREATE INDEX IF NOT EXISTS idx_expert_directory_name ON expert_directory(full_name COLLATE NOCASE)")
                connection.commit()

    def upsert_expert(self, expert: Dict[str, Any]) -> None:
        shard_id = int(expert.get("shard_id") or 0) % self.shard_count
        with self._connect(shard_id) as connection:
            connection.execute(
                """
                INSERT INTO expert_directory (
                  expert_id, user_id, full_name, email, primary_expertise, years_of_experience, bio,
                  available, serves_as_resident, expertise_areas_json,
                  avg_rating, total_jobs, acceptance_rate, completion_rate, cancellation_rate, avg_response_time_sec,
                  latitude, longitude, city, region_bucket, shard_id, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(expert_id) DO UPDATE SET
                  user_id = excluded.user_id,
                  full_name = excluded.full_name,
                  email = excluded.email,
                  primary_expertise = excluded.primary_expertise,
                  years_of_experience = excluded.years_of_experience,
                  bio = excluded.bio,
                  available = excluded.available,
                  serves_as_resident = excluded.serves_as_resident,
                  expertise_areas_json = excluded.expertise_areas_json,
                  avg_rating = excluded.avg_rating,
                  total_jobs = excluded.total_jobs,
                  acceptance_rate = excluded.acceptance_rate,
                  completion_rate = excluded.completion_rate,
                  cancellation_rate = excluded.cancellation_rate,
                  avg_response_time_sec = excluded.avg_response_time_sec,
                  latitude = excluded.latitude,
                  longitude = excluded.longitude,
                  city = excluded.city,
                  region_bucket = excluded.region_bucket,
                  shard_id = excluded.shard_id,
                  updated_at = CURRENT_TIMESTAMP
                """,
                [
                    expert["expert_id"],
                    expert["user_id"],
                    expert["full_name"],
                    expert["email"],
                    expert["primary_expertise"],
                    expert["years_of_experience"],
                    expert.get("bio"),
                    int(bool(expert.get("available", False))),
                    int(bool(expert.get("serves_as_resident", False))),
                    json.dumps(expert.get("expertise_areas", []), sort_keys=True),
                    float(expert.get("avg_rating", 0.0) or 0.0),
                    int(expert.get("total_jobs", 0) or 0),
                    float(expert.get("acceptance_rate", 0.0) or 0.0),
                    float(expert.get("completion_rate", 0.0) or 0.0),
                    float(expert.get("cancellation_rate", 0.0) or 0.0),
                    int(expert.get("avg_response_time_sec", 0) or 0),
                    expert.get("latitude"),
                    expert.get("longitude"),
                    expert.get("city"),
                    expert.get("region_bucket"),
                    shard_id,
                ],
            )
            connection.commit()

    def get_expert(self, expert_id: int) -> Optional[Dict[str, Any]]:
        for shard_id in range(self.shard_count):
            with self._connect(shard_id) as connection:
                row = connection.execute("SELECT * FROM expert_directory WHERE expert_id = ?", [expert_id]).fetchone()
                if row is not None:
                    return self._row_to_expert(row)
        return None

    def query_experts(
        self,
        *,
        available_only: bool,
        search: str | None,
        primary_expertise: str | None,
        expertise_area: str | None,
        serves_as_resident: bool | None,
        min_years_experience: int | None,
        max_years_experience: int | None,
        region_buckets: Sequence[str] | None,
        page: int,
        page_size: int,
    ) -> Dict[str, Any]:
        rows: List[Dict[str, Any]] = []
        shard_ids = self._target_shards(region_buckets)
        where_clauses: List[str] = []
        params: List[Any] = []

        if available_only:
            where_clauses.append("available = 1")
        if primary_expertise:
            where_clauses.append("LOWER(primary_expertise) = LOWER(?)")
            params.append(primary_expertise)
        if serves_as_resident is not None:
            where_clauses.append("serves_as_resident = ?")
            params.append(1 if serves_as_resident else 0)
        if min_years_experience is not None:
            where_clauses.append("years_of_experience >= ?")
            params.append(min_years_experience)
        if max_years_experience is not None:
            where_clauses.append("years_of_experience <= ?")
            params.append(max_years_experience)
        if region_buckets:
            placeholders = ",".join("?" for _ in region_buckets)
            where_clauses.append(f"COALESCE(region_bucket, 'global') IN ({placeholders})")
            params.extend(region_buckets)
        if expertise_area:
            where_clauses.append("LOWER(expertise_areas_json) LIKE ?")
            params.append(f"%{expertise_area.lower()}%")
        if search:
            search_term = f"%{search.strip().lower()}%"
            where_clauses.append(
                "("
                "LOWER(full_name) LIKE ? OR LOWER(email) LIKE ? "
                "OR LOWER(primary_expertise) LIKE ? "
                "OR LOWER(COALESCE(bio, '')) LIKE ? "
                "OR LOWER(expertise_areas_json) LIKE ?"
                ")"
            )
            params.extend([search_term, search_term, search_term, search_term, search_term])

        sql = "SELECT * FROM expert_directory"
        if where_clauses:
            sql += " WHERE " + " AND ".join(where_clauses)

        for shard_id in shard_ids:
            with self._connect(shard_id) as connection:
                connection.row_factory = sqlite3.Row
                shard_rows = connection.execute(sql, params).fetchall()
                for row in shard_rows:
                    rows.append(self._row_to_expert(row))

        rows.sort(key=lambda item: (-int(item.get("years_of_experience", 0)), item.get("full_name", "").lower()))
        total_items = len(rows)
        start = max(page - 1, 0) * page_size
        end = start + page_size
        items = rows[start:end]
        return {
            "items": items,
            "total_items": total_items,
            "total_pages": ((total_items + page_size - 1) // page_size) if total_items else 0,
            "signature": {
                "total_items": total_items,
                "latest_updated_at": max((item.get("updated_at") for item in rows), default=None) if rows else None,
            },
        }

    def sync_from_rows(self, rows: Iterable[Dict[str, Any]]) -> None:
        for row in rows:
            self.upsert_expert(row)

    def _target_shards(self, region_buckets: Sequence[str] | None) -> List[int]:
        if not region_buckets:
            return list(range(self.shard_count))
        shard_ids = set()
        for bucket in region_buckets:
            shard_ids.add(self._shard_for_bucket(bucket))
        return sorted(shard_ids)

    def _shard_for_bucket(self, bucket: str) -> int:
        digest = sha256(bucket.encode("utf-8")).hexdigest()
        return int(digest[:8], 16) % self.shard_count

    def _db_path(self, shard_id: int) -> Path:
        return self.base_dir / f"experts-shard-{shard_id}.db"

    def _connect(self, shard_id: int) -> sqlite3.Connection:
        self.base_dir.mkdir(parents=True, exist_ok=True)
        connection = sqlite3.connect(self._db_path(shard_id))
        connection.row_factory = sqlite3.Row
        return connection

    def _row_to_expert(self, row: sqlite3.Row) -> Dict[str, Any]:
        return {
            "expert_id": int(row["expert_id"]),
            "user_id": int(row["user_id"]),
            "full_name": row["full_name"],
            "email": row["email"],
            "primary_expertise": row["primary_expertise"],
            "years_of_experience": int(row["years_of_experience"]),
            "bio": row["bio"],
            "available": bool(row["available"]),
            "serves_as_resident": bool(row["serves_as_resident"]),
            "expertise_areas": json.loads(row["expertise_areas_json"] or "[]"),
            "avg_rating": float(row["avg_rating"] or 0.0),
            "total_jobs": int(row["total_jobs"] or 0),
            "acceptance_rate": float(row["acceptance_rate"] or 0.0),
            "completion_rate": float(row["completion_rate"] or 0.0),
            "cancellation_rate": float(row["cancellation_rate"] or 0.0),
            "avg_response_time_sec": int(row["avg_response_time_sec"] or 0),
            "latitude": float(row["latitude"]) if row["latitude"] is not None else None,
            "longitude": float(row["longitude"]) if row["longitude"] is not None else None,
            "city": row["city"],
            "region_bucket": row["region_bucket"],
            "shard_id": int(row["shard_id"]) if row["shard_id"] is not None else None,
            "updated_at": row["updated_at"],
        }
