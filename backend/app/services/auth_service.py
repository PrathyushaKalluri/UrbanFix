from __future__ import annotations

from typing import Dict, List, Optional

from ..core.sharding import SpatialShardRouter
from ..core.shard_store import ShardExpertStore
from ..core.security import create_access_token, hash_password, verify_password
from ..db.repository import Repository


class AuthService:
    def __init__(
        self,
        repository: Repository,
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

        user_id = self.repository.execute(
            "INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)",
            [full_name, email.lower(), hash_password(password)],
        )
        self.repository.execute("INSERT INTO user_roles (user_id, role) VALUES (?, 'USER')", [user_id])
        user = self.repository.fetchone("SELECT id, full_name, email FROM users WHERE id = ?", [user_id])
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

        user_id = self.repository.execute(
            "INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)",
            [full_name, email.lower(), hash_password(password)],
        )
        self.repository.execute("INSERT INTO user_roles (user_id, role) VALUES (?, 'EXPERT')", [user_id])
        self.repository.execute(
            """
            INSERT INTO expert_profiles
            (user_id, primary_expertise, years_of_experience, bio, is_available, serves_as_resident, verification_status, avg_rating, total_jobs, city, latitude, longitude, region_bucket, shard_id)
            VALUES (?, ?, ?, ?, ?, ?, 'PENDING', 0, 0, ?, ?, ?, ?, ?)
            """,
            [user_id, normalized_primary, max(0, years_of_experience), bio, int(available), int(serves_as_resident), city, latitude, longitude, region_bucket, shard_id],
        )
        for skill in sorted(set(normalized_expertise)):
            self.repository.execute("INSERT INTO expert_expertise (user_id, skill) VALUES (?, ?)", [user_id, skill])
        self.repository.execute(
            "INSERT INTO expert_metrics (user_id, acceptance_rate, completion_rate, cancellation_rate, avg_response_time_sec) VALUES (?, 0, 0, 0, 0)",
            [user_id],
        )
        if self.shard_store is not None:
            self.shard_store.upsert_expert(
                {
                    "expert_id": user_id,
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
        user = self.repository.fetchone("SELECT id, full_name, email FROM users WHERE id = ?", [user_id])
        return self._build_response(user, "EXPERT")

    def login(self, email: str, password: str) -> Dict[str, object]:
        user = self.repository.fetchone("SELECT * FROM users WHERE email = ?", [email.lower()])
        if not user or not verify_password(password, user["password_hash"]):
            raise PermissionError("Invalid email or password")

        role_row = self.repository.fetchone(
            "SELECT role FROM user_roles WHERE user_id = ? ORDER BY role LIMIT 1",
            [user["id"]],
        )
        role = role_row["role"] if role_row else "USER"
        return self._build_response(user, role)

    def current_user_profile(self, user_id: int) -> Dict[str, object]:
        user = self.repository.fetchone("SELECT * FROM users WHERE id = ?", [user_id])
        if not user:
            raise LookupError("User not found")

        role_rows = self.repository.fetchall("SELECT role FROM user_roles WHERE user_id = ?", [user_id])
        roles = {row["role"] for row in role_rows}
        profile: Dict[str, object] = {
            "full_name": user["full_name"],
            "email": user["email"],
            "role": "EXPERT" if "EXPERT" in roles else "USER",
        }

        if "EXPERT" in roles:
            expert = self.repository.fetchone("SELECT * FROM expert_profiles WHERE user_id = ?", [user_id])
            if expert:
                expertise = self.repository.fetchall("SELECT skill FROM expert_expertise WHERE user_id = ? ORDER BY skill", [user_id])
                profile.update(
                    {
                        "primary_expertise": expert["primary_expertise"],
                        "years_of_experience": expert["years_of_experience"],
                        "expertise_areas": [row["skill"] for row in expertise],
                        "bio": expert["bio"],
                        "available": bool(expert["is_available"]),
                        "serves_as_resident": bool(expert["serves_as_resident"]),
                        "city": expert["city"],
                        "latitude": expert["latitude"],
                        "longitude": expert["longitude"],
                        "region_bucket": expert["region_bucket"],
                        "shard_id": expert["shard_id"],
                    }
                )

        return profile
