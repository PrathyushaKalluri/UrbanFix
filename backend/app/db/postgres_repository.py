from __future__ import annotations

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


class PostgresRepository:
    def __init__(self, connection) -> None:
        self.connection = connection

    def fetchone(self, sql: str, parameters: Iterable[Any] = ()):
        cursor = self.connection.execute(self._prepare_sql(sql), tuple(parameters))
        return cursor.fetchone()

    def fetchall(self, sql: str, parameters: Iterable[Any] = ()):
        cursor = self.connection.execute(self._prepare_sql(sql), tuple(parameters))
        return cursor.fetchall()

    def execute(self, sql: str, parameters: Iterable[Any] = ()):
        cursor = self.connection.execute(self._prepare_sql(sql), tuple(parameters))
        return getattr(cursor, "rowcount", 0)

    def execute_returning_id(self, sql: str, parameters: Iterable[Any] = ()):
        """Execute INSERT with RETURNING id and return the generated primary key."""
        sql = self._prepare_sql(sql)
        if "RETURNING" not in sql.upper():
            sql = sql.rstrip(";") + " RETURNING id"
        cursor = self.connection.execute(sql, tuple(parameters))
        row = cursor.fetchone()
        return row["id"] if row else None

    def executemany(self, sql: str, parameters: Sequence[Sequence[Any]]) -> None:
        self.connection.executemany(self._prepare_sql(sql), parameters)

    def expert_row_by_id(self, expert_id: int) -> Optional[ExpertRow]:
        rows = self.expert_rows(limit=1, expert_id=expert_id)
        return rows[0] if rows else None

    def expert_row_by_user_id(self, user_id: int) -> Optional[ExpertRow]:
        rows = self.expert_rows(limit=1, user_id=user_id)
        return rows[0] if rows else None

    def expert_rows(
        self,
        available_only: bool = False,
        *,
        limit: int | None = None,
        offset: int | None = None,
        expert_id: int | None = None,
        user_id: int | None = None,
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
            user_id=user_id,
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
                    bio=None,
                    available=bool(row["available"]),
                    serves_as_resident=False,
                    expertise_areas=sorted(expertise_areas),
                    avg_rating=float(row["avg_rating"] or 0),
                    total_jobs=int(row["total_jobs"] or 0),
                    acceptance_rate=float(row["acceptance_rate"] or 0),
                    completion_rate=float(row["completion_rate"] or 0),
                    cancellation_rate=float(row["cancellation_rate"] or 0),
                    avg_response_time_sec=int(row["avg_response_time_sec"] or 0),
                    latitude=float(row["latitude"]) if row["latitude"] is not None else None,
                    longitude=float(row["longitude"]) if row["longitude"] is not None else None,
                    city=None,
                    region_bucket=None,
                    shard_id=None,
                )
            )
        return experts

    def expert_count(
        self,
        available_only: bool = False,
        *,
        expert_id: int | None = None,
        user_id: int | None = None,
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
            user_id=user_id,
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
            return {"total_items": 0, "available_items": 0, "latest_updated_at": None}
        return {
            "total_items": int(row["total_items"] or 0),
            "available_items": int(row["available_items"] or 0),
            "latest_updated_at": None,
        }

    def _expert_query(
        self,
        *,
        available_only: bool,
        expert_id: int | None = None,
        user_id: int | None = None,
        search: str | None = None,
        primary_expertise: str | None = None,
        expertise_area: str | None = None,
        serves_as_resident: bool | None = None,
        min_years_experience: int | None = None,
        max_years_experience: int | None = None,
        region_buckets: Sequence[str] | None = None,
        include_pagination: bool = False,
        count_only: bool = False,
        signature_only: bool = False,
        limit: int | None = None,
        offset: int | None = None,
    ) -> tuple[str, List[Any]]:
        if signature_only:
            select_clause = """
                SELECT
                  COUNT(DISTINCT ep.id) AS total_items,
                  COUNT(*) FILTER (WHERE ep.available) AS available_items
            """
        elif count_only:
            select_clause = """
                SELECT
                  COUNT(DISTINCT ep.id) AS total_items
            """
        else:
            select_clause = """
                SELECT
                  ep.id AS expert_id,
                  u.id AS user_id,
                  u.full_name,
                  u.email,
                  ep.primary_expertise,
                  ep.years_of_experience,
                  NULL::text AS bio,
                  ep.available,
                  FALSE AS serves_as_resident,
                  COALESCE(STRING_AGG(DISTINCT ee.expertise, '||'), '') AS expertise_areas,
                  0::double precision AS avg_rating,
                  0::integer AS total_jobs,
                  0::double precision AS acceptance_rate,
                  0::double precision AS completion_rate,
                  0::double precision AS cancellation_rate,
                  0::integer AS avg_response_time_sec,
                  ep.latitude,
                  ep.longitude,
                  NULL::text AS city,
                  NULL::text AS region_bucket,
                  NULL::bigint AS shard_id
            """

        from_clause = """
            FROM expert_profiles ep
            INNER JOIN users u ON u.id = ep.user_id
            LEFT JOIN expert_expertise ee ON ee.expert_profile_id = ep.id
        """

        where_clauses = ["1 = 1"]
        params: List[Any] = []

        if expert_id is not None:
            where_clauses.append("ep.id = %s")
            params.append(expert_id)

        if user_id is not None:
            where_clauses.append("ep.user_id = %s")
            params.append(user_id)

        if available_only:
            where_clauses.append("ep.available = TRUE")

        if primary_expertise:
            where_clauses.append("LOWER(ep.primary_expertise) = LOWER(%s)")
            params.append(primary_expertise)

        if expertise_area:
            where_clauses.append(
                "EXISTS (SELECT 1 FROM expert_expertise ee2 WHERE ee2.expert_profile_id = ep.id AND LOWER(ee2.expertise) = LOWER(%s))"
            )
            params.append(expertise_area)

        if search:
            like = f"%{search.strip().lower()}%"
            where_clauses.append(
                "(" \
                "LOWER(u.full_name) LIKE %s OR LOWER(u.email) LIKE %s OR LOWER(ep.primary_expertise) LIKE %s OR LOWER(COALESCE(ep.service_area, '')) LIKE %s OR EXISTS (SELECT 1 FROM expert_expertise ee3 WHERE ee3.expert_profile_id = ep.id AND LOWER(ee3.expertise) LIKE %s)" \
                ")"
            )
            params.extend([like, like, like, like, like])

        if min_years_experience is not None:
            where_clauses.append("ep.years_of_experience >= %s")
            params.append(min_years_experience)

        if max_years_experience is not None:
            where_clauses.append("ep.years_of_experience <= %s")
            params.append(max_years_experience)

        sql = f"{select_clause}\n{from_clause}\nWHERE {' AND '.join(where_clauses)}"

        if not count_only and not signature_only:
            sql += "\nGROUP BY ep.id, u.id, u.full_name, u.email, ep.primary_expertise, ep.years_of_experience, ep.available, ep.latitude, ep.longitude"
            sql += "\nORDER BY u.full_name ASC, ep.id ASC"
            if include_pagination and limit is not None:
                sql += "\nLIMIT %s"
                params.append(limit)
                if offset is not None:
                    sql += "\nOFFSET %s"
                    params.append(offset)

        return sql, params

    @staticmethod
    def _prepare_sql(sql: str) -> str:
        return sql.replace("?", "%s")