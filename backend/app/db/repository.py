from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any, Dict, Iterable, List, Optional, Sequence


@dataclass(frozen=True)
class ExpertRow:
    expert_id: int
    user_id: int
    full_name: str
    email: str
    primary_expertise: str
    years_of_experience: int
    bio: Optional[str]
    available: bool
    serves_as_resident: bool
    expertise_areas: List[str]
    avg_rating: float
    total_jobs: int
    acceptance_rate: float
    completion_rate: float
    cancellation_rate: float
    avg_response_time_sec: int
    latitude: Optional[float]
    longitude: Optional[float]
    city: Optional[str]
    region_bucket: Optional[str]
    shard_id: Optional[int]


@dataclass(frozen=True)
class JobRow:
    job_id: str
    job_type: str
    status: str
    user_id: Optional[int]
    payload_json: str
    result_json: Optional[str]
    error_message: Optional[str]
    region_bucket: Optional[str]
    shard_id: Optional[int]
    created_at: str
    updated_at: str


@dataclass(frozen=True)
class NotificationRow:
    notification_id: int
    user_id: int
    channel: str
    title: str
    body: str
    payload_json: str
    is_read: bool
    created_at: str
    read_at: Optional[str]


class Repository:
    def __init__(self, connection) -> None:
        self.connection = connection

    def fetchone(self, sql: str, parameters: Iterable[Any] = ()):
        cursor = self.connection.execute(sql, tuple(parameters))
        return cursor.fetchone()

    def fetchall(self, sql: str, parameters: Iterable[Any] = ()):
        cursor = self.connection.execute(sql, tuple(parameters))
        return cursor.fetchall()

    def execute(self, sql: str, parameters: Iterable[Any] = ()):
        cursor = self.connection.execute(sql, tuple(parameters))
        return cursor.lastrowid

    def executemany(self, sql: str, parameters: Sequence[Sequence[Any]]) -> None:
        self.connection.executemany(sql, parameters)

    def expert_row_by_id(self, expert_id: int) -> Optional[ExpertRow]:
        rows = self.expert_rows(limit=1, expert_id=expert_id)
        return rows[0] if rows else None

    def expert_rows(
        self,
        available_only: bool = False,
        *,
        limit: int | None = None,
        offset: int | None = None,
        expert_id: int | None = None,
        search: str | None = None,
        primary_expertise: str | None = None,
        expertise_area: str | None = None,
        serves_as_resident: bool | None = None,
        min_years_experience: int | None = None,
        max_years_experience: int | None = None,
        region_buckets: Sequence[str] | None = None,
    ) -> List[ExpertRow]:
        sql, params = self._expert_query(
            available_only=available_only,
            expert_id=expert_id,
            search=search,
            primary_expertise=primary_expertise,
            expertise_area=expertise_area,
            serves_as_resident=serves_as_resident,
            min_years_experience=min_years_experience,
            max_years_experience=max_years_experience,
            region_buckets=region_buckets,
            include_pagination=True,
            limit=limit,
            offset=offset,
        )
        rows = self.fetchall(sql, params)
        experts: List[ExpertRow] = []
        for row in rows:
            expertise_areas = []
            if row["expertise_areas"]:
                expertise_areas = [item for item in str(row["expertise_areas"]).split("||") if item]
            experts.append(
                ExpertRow(
                    expert_id=int(row["expert_id"]),
                    user_id=int(row["user_id"]),
                    full_name=row["full_name"],
                    email=row["email"],
                    primary_expertise=row["primary_expertise"],
                    years_of_experience=int(row["years_of_experience"]),
                    bio=row["bio"],
                    available=bool(row["is_available"]),
                    serves_as_resident=bool(row["serves_as_resident"]),
                    expertise_areas=sorted(expertise_areas),
                    avg_rating=float(row["avg_rating"] or 0),
                    total_jobs=int(row["total_jobs"] or 0),
                    acceptance_rate=float(row["acceptance_rate"] or 0),
                    completion_rate=float(row["completion_rate"] or 0),
                    cancellation_rate=float(row["cancellation_rate"] or 0),
                    avg_response_time_sec=int(row["avg_response_time_sec"] or 0),
                    latitude=float(row["latitude"]) if row["latitude"] is not None else None,
                    longitude=float(row["longitude"]) if row["longitude"] is not None else None,
                    city=row["city"],
                    region_bucket=row["region_bucket"],
                    shard_id=int(row["shard_id"]) if row["shard_id"] is not None else None,
                )
            )
        return experts

    def expert_count(
        self,
        available_only: bool = False,
        *,
        expert_id: int | None = None,
        search: str | None = None,
        primary_expertise: str | None = None,
        expertise_area: str | None = None,
        serves_as_resident: bool | None = None,
        min_years_experience: int | None = None,
        max_years_experience: int | None = None,
        region_buckets: Sequence[str] | None = None,
    ) -> int:
        sql, params = self._expert_query(
            available_only=available_only,
            expert_id=expert_id,
            search=search,
            primary_expertise=primary_expertise,
            expertise_area=expertise_area,
            serves_as_resident=serves_as_resident,
            min_years_experience=min_years_experience,
            max_years_experience=max_years_experience,
            region_buckets=region_buckets,
            include_pagination=False,
            count_only=True,
        )
        row = self.fetchone(sql, params)
        return int(row["total_items"] if row is not None else 0)

    def expert_catalog_signature(
        self,
        available_only: bool = False,
        *,
        search: str | None = None,
        primary_expertise: str | None = None,
        expertise_area: str | None = None,
        serves_as_resident: bool | None = None,
        min_years_experience: int | None = None,
        max_years_experience: int | None = None,
        region_buckets: Sequence[str] | None = None,
    ) -> Dict[str, Any]:
        sql, params = self._expert_query(
            available_only=available_only,
            search=search,
            primary_expertise=primary_expertise,
            expertise_area=expertise_area,
            serves_as_resident=serves_as_resident,
            min_years_experience=min_years_experience,
            max_years_experience=max_years_experience,
            region_buckets=region_buckets,
            include_pagination=False,
            signature_only=True,
        )
        row = self.fetchone(sql, params)
        if row is None:
            return {"total_items": 0, "latest_updated_at": None}
        return {
            "total_items": int(row["total_items"] or 0),
            "latest_updated_at": row["latest_updated_at"],
        }

    def _expert_query(
        self,
        *,
        available_only: bool,
        expert_id: int | None = None,
        search: str | None = None,
        primary_expertise: str | None = None,
        expertise_area: str | None = None,
        serves_as_resident: bool | None = None,
        min_years_experience: int | None = None,
        max_years_experience: int | None = None,
        region_buckets: Sequence[str] | None = None,
        include_pagination: bool,
        count_only: bool = False,
        signature_only: bool = False,
        limit: int | None = None,
        offset: int | None = None,
    ) -> tuple[str, List[Any]]:
        select_clause = """
            SELECT
              COUNT(DISTINCT u.id) AS total_items,
              MAX(COALESCE(ep.updated_at, u.updated_at, em.updated_at)) AS latest_updated_at
        """
        if not count_only and not signature_only:
            select_clause = """
                SELECT
                  u.id AS expert_id,
                  u.id AS user_id,
                  u.full_name,
                  u.email,
                  ep.primary_expertise,
                  ep.years_of_experience,
                  ep.bio,
                  ep.is_available,
                  ep.serves_as_resident,
                  COALESCE(em.acceptance_rate, 0) AS acceptance_rate,
                  COALESCE(em.completion_rate, 0) AS completion_rate,
                  COALESCE(em.cancellation_rate, 0) AS cancellation_rate,
                  COALESCE(em.avg_response_time_sec, 0) AS avg_response_time_sec,
                  COALESCE(ep.avg_rating, 0) AS avg_rating,
                  COALESCE(ep.total_jobs, 0) AS total_jobs,
                GROUP_CONCAT(ee.skill, '||') AS expertise_areas,
                ep.latitude AS latitude,
                ep.longitude AS longitude,
                ep.city AS city,
                ep.region_bucket AS region_bucket,
                ep.shard_id AS shard_id
            """

        sql = f"""
            {select_clause}
            FROM users u
            JOIN user_roles ur ON ur.user_id = u.id AND ur.role = 'EXPERT'
            JOIN expert_profiles ep ON ep.user_id = u.id
            LEFT JOIN expert_expertise ee ON ee.user_id = u.id
            LEFT JOIN expert_metrics em ON em.user_id = u.id
        """
        where_clauses: List[str] = []
        params: List[Any] = []

        if available_only:
            where_clauses.append("ep.is_available = 1")
        if expert_id is not None:
            where_clauses.append("u.id = ?")
            params.append(expert_id)
        if primary_expertise:
            where_clauses.append("LOWER(ep.primary_expertise) = LOWER(?)")
            params.append(primary_expertise)
        if expertise_area:
            where_clauses.append("EXISTS (SELECT 1 FROM expert_expertise ee2 WHERE ee2.user_id = u.id AND LOWER(ee2.skill) LIKE LOWER(?))")
            params.append(f"%{expertise_area}%")
        if serves_as_resident is not None:
            where_clauses.append("ep.serves_as_resident = ?")
            params.append(1 if serves_as_resident else 0)
        if min_years_experience is not None:
            where_clauses.append("ep.years_of_experience >= ?")
            params.append(min_years_experience)
        if max_years_experience is not None:
            where_clauses.append("ep.years_of_experience <= ?")
            params.append(max_years_experience)
        if region_buckets:
            placeholders = ",".join("?" for _ in region_buckets)
            where_clauses.append(f"COALESCE(ep.region_bucket, 'global') IN ({placeholders})")
            params.extend(list(region_buckets))
        if search:
            search_term = f"%{search.strip().lower()}%"
            where_clauses.append(
                "(" \
                "LOWER(u.full_name) LIKE ? OR LOWER(u.email) LIKE ? OR LOWER(ep.primary_expertise) LIKE ? OR LOWER(COALESCE(ep.bio, '')) LIKE ? OR EXISTS (SELECT 1 FROM expert_expertise ee3 WHERE ee3.user_id = u.id AND LOWER(ee3.skill) LIKE ?)" \
                ")"
            )
            params.extend([search_term, search_term, search_term, search_term, search_term])

        if where_clauses:
            sql += " WHERE " + " AND ".join(where_clauses)

        if not count_only and not signature_only:
            sql += """
                GROUP BY
                  u.id, u.full_name, u.email, ep.primary_expertise, ep.years_of_experience,
                  ep.bio, ep.is_available, ep.serves_as_resident, ep.avg_rating, ep.total_jobs,
                  ep.latitude, ep.longitude, ep.city, ep.region_bucket, ep.shard_id,
                  em.acceptance_rate, em.completion_rate, em.cancellation_rate, em.avg_response_time_sec
                ORDER BY ep.years_of_experience DESC, u.full_name COLLATE NOCASE ASC
            """
            if include_pagination:
                if limit is not None:
                    sql += " LIMIT ?"
                    params.append(limit)
                if offset is not None:
                    sql += " OFFSET ?"
                    params.append(offset)

        return sql, params

    def create_job(
        self,
        *,
        job_id: str,
        job_type: str,
        status: str,
        user_id: Optional[int],
        payload: Dict[str, Any],
        region_bucket: Optional[str],
        shard_id: Optional[int],
    ) -> None:
        self.execute(
            """
            INSERT INTO async_jobs (job_id, job_type, status, user_id, payload_json, region_bucket, shard_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            [job_id, job_type, status, user_id, json.dumps(payload, sort_keys=True, default=str), region_bucket, shard_id],
        )

    def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        row = self.fetchone("SELECT * FROM async_jobs WHERE job_id = ?", [job_id])
        return dict(row) if row is not None else None

    def update_job_status(self, job_id: str, status: str) -> None:
        self.execute("UPDATE async_jobs SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE job_id = ?", [status, job_id])

    def complete_job(self, job_id: str, result: Dict[str, Any]) -> None:
        self.execute(
            "UPDATE async_jobs SET status = 'COMPLETED', result_json = ?, updated_at = CURRENT_TIMESTAMP WHERE job_id = ?",
            [json.dumps(result, sort_keys=True, default=str), job_id],
        )

    def fail_job(self, job_id: str, error_message: str) -> None:
        self.execute(
            "UPDATE async_jobs SET status = 'FAILED', error_message = ?, updated_at = CURRENT_TIMESTAMP WHERE job_id = ?",
            [error_message, job_id],
        )

    def create_notification(self, *, user_id: int, channel: str, title: str, body: str, payload: Dict[str, Any]) -> None:
        self.execute(
            "INSERT INTO notifications (user_id, channel, title, body, payload_json) VALUES (?, ?, ?, ?, ?)",
            [user_id, channel, title, body, json.dumps(payload, sort_keys=True, default=str)],
        )

    def list_notifications(self, user_id: int) -> List[Dict[str, Any]]:
        rows = self.fetchall("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC, notification_id DESC", [user_id])
        return [dict(row) for row in rows]
