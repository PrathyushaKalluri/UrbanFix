from __future__ import annotations

from typing import Dict, List, Optional

from ..core.sharding import SpatialShardRouter
from ..core.shard_store import ShardExpertStore
from ..core.security import create_access_token, hash_password, verify_password
from ..db.postgres_repository import PostgresRepository


class PostgresAuthService:
    def __init__(
        self,
        repository: PostgresRepository,
        shard_router: SpatialShardRouter | None = None,
        shard_store: ShardExpertStore | None = None,
    ) -> None:
        self.repository = repository
        self.shard_router = shard_router or SpatialShardRouter()
        self.shard_store = shard_store

    def _build_response(self, user_row, role: str) -> Dict[str, object]:
        token = create_access_token(str(user_row["id"]), {"role": role, "email": user_row["email"]})
        return {
            "token": token,
            "full_name": user_row["full_name"],
            "email": user_row["email"],
            "role": role,
        }

    def register_user(self, full_name: str, email: str, password: str) -> Dict[str, object]:
        existing = self.repository.fetchone("SELECT id FROM users WHERE email = ?", [email.lower()])
        if existing:
            raise ValueError("Email is already registered")

        user_id = self.repository.execute_returning_id(
            "INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)",
            [full_name, email.lower(), hash_password(password), "USER"],
        )
        user = self.repository.fetchone("SELECT id, full_name, email, role FROM users WHERE id = ?", [user_id])
        return self._build_response(user, "USER")

    def register_expert(
        self,
        full_name: str,
        email: str,
        password: str,
        primary_expertise: str,
        years_of_experience: int,
        expertise_areas: List[str],
        bio: Optional[str],
        available: bool,
        serves_as_resident: bool,
        city: Optional[str] = None,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
    ) -> Dict[str, object]:
        existing = self.repository.fetchone("SELECT id FROM users WHERE email = ?", [email.lower()])
        if existing:
            raise ValueError("Email is already registered")

        normalized_primary = primary_expertise.strip() if primary_expertise and primary_expertise.strip() else "General Services"
        normalized_expertise = [item.strip() for item in expertise_areas if item and item.strip()]
        if not normalized_expertise:
            normalized_expertise = [normalized_primary]

        region_bucket = None
        shard_id = None
        if latitude is not None and longitude is not None:
            route = self.shard_router.route_for_point(latitude, longitude)
            region_bucket = route.region_bucket
            shard_id = route.shard_id

        user_id = self.repository.execute_returning_id(
            "INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)",
            [full_name, email.lower(), hash_password(password), "EXPERT"],
        )

        profile_id = self.repository.execute_returning_id(
            """
            INSERT INTO expert_profiles
            (user_id, primary_expertise, years_of_experience, available, latitude, longitude, service_area)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            [user_id, normalized_primary, max(0, years_of_experience), available, latitude, longitude, city],
        )

        for skill in sorted(set(normalized_expertise)):
            self.repository.execute(
                "INSERT INTO expert_expertise (expert_profile_id, expertise) VALUES (?, ?)",
                [profile_id, skill],
            )

        if self.shard_store is not None:
            self.shard_store.upsert_expert(
                {
                    "expert_id": profile_id,
                    "user_id": user_id,
                    "full_name": full_name,
                    "email": email.lower(),
                    "primary_expertise": normalized_primary,
                    "years_of_experience": max(0, years_of_experience),
                    "bio": bio,
                    "available": available,
                    "serves_as_resident": serves_as_resident,
                    "expertise_areas": sorted(set(normalized_expertise)),
                    "avg_rating": 0.0,
                    "total_jobs": 0,
                    "acceptance_rate": 0.0,
                    "completion_rate": 0.0,
                    "cancellation_rate": 0.0,
                    "avg_response_time_sec": 0,
                    "latitude": latitude,
                    "longitude": longitude,
                    "city": city,
                    "region_bucket": region_bucket,
                    "shard_id": shard_id,
                }
            )
        user = self.repository.fetchone("SELECT id, full_name, email, role FROM users WHERE id = ?", [user_id])
        return self._build_response(user, "EXPERT")

    def login(self, email: str, password: str) -> Dict[str, object]:
        user = self.repository.fetchone("SELECT * FROM users WHERE email = ?", [email.lower()])
        if not user or not verify_password(password, user["password"]):
            raise PermissionError("Invalid email or password")

        role = user.get("role", "USER")
        return self._build_response(user, role)

    def current_user_profile(self, user_id: int) -> Dict[str, object]:
        user = self.repository.fetchone("SELECT * FROM users WHERE id = ?", [user_id])
        if not user:
            raise LookupError("User not found")

        role = user.get("role", "USER")
        profile: Dict[str, object] = {
            "full_name": user["full_name"],
            "email": user["email"],
            "role": role,
        }

        if role == "EXPERT":
            expert = self.repository.fetchone("SELECT * FROM expert_profiles WHERE user_id = ?", [user_id])
            if expert:
                profile_id = expert["id"]
                expertise_rows = self.repository.fetchall(
                    "SELECT expertise FROM expert_expertise WHERE expert_profile_id = ? ORDER BY expertise",
                    [profile_id],
                )
                expertise_areas = []
                for row in expertise_rows:
                    val = row["expertise"]
                    if val and val != "true":
                        # Some rows have comma-separated values
                        for item in str(val).split(","):
                            item = item.strip()
                            if item and item != "true":
                                expertise_areas.append(item)

                profile.update(
                    {
                        "primary_expertise": expert["primary_expertise"],
                        "years_of_experience": expert["years_of_experience"] or 0,
                        "expertise_areas": expertise_areas,
                        "bio": "",
                        "available": bool(expert["available"]),
                        "serves_as_resident": False,
                        "city": expert.get("service_area") or "",
                        "latitude": expert.get("latitude"),
                        "longitude": expert.get("longitude"),
                        "region_bucket": None,
                        "shard_id": None,
                    }
                )

        return profile
