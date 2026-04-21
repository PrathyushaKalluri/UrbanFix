from __future__ import annotations

from typing import Iterable, Sequence

from ..core.sharding import SpatialShardRouter
from ..core.security import hash_password
from .repository import Repository


def _execute_many(connection, sql: str, rows: Sequence[Sequence[object]]) -> None:
    connection.executemany(sql, rows)


def seed_demo_data(connection) -> None:
    repo = Repository(connection)
    if repo.fetchone("SELECT COUNT(*) AS count FROM users")["count"]:
        return

    shard_router = SpatialShardRouter()

    users = [
        (1, "Kedar Dalvi", "kedar@urbanfix.in", None, hash_password("password"), "2026-04-21T00:00:00Z", "2026-04-21T00:00:00Z"),
        (2, "Expert One", "expert001@urbanfix.in", None, hash_password("password"), "2026-04-21T00:00:00Z", "2026-04-21T00:00:00Z"),
        (3, "Expert Two", "expert002@urbanfix.in", None, hash_password("password"), "2026-04-21T00:00:00Z", "2026-04-21T00:00:00Z"),
        (4, "Expert Three", "expert003@urbanfix.in", None, hash_password("password"), "2026-04-21T00:00:00Z", "2026-04-21T00:00:00Z"),
        (5, "Expert Four", "expert004@urbanfix.in", None, hash_password("password"), "2026-04-21T00:00:00Z", "2026-04-21T00:00:00Z"),
        (6, "Expert Five", "expert005@urbanfix.in", None, hash_password("password"), "2026-04-21T00:00:00Z", "2026-04-21T00:00:00Z"),
    ]
    _execute_many(
        connection,
        "INSERT INTO users (id, full_name, email, phone, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        users,
    )

    roles = [
        (1, "USER"),
        (2, "EXPERT"),
        (3, "EXPERT"),
        (4, "EXPERT"),
        (5, "EXPERT"),
        (6, "EXPERT"),
    ]
    _execute_many(connection, "INSERT INTO user_roles (user_id, role) VALUES (?, ?)", roles)

    expert_locations = {
        2: ("Mumbai", 19.0760, 72.8777),
        3: ("Pune", 18.5204, 73.8567),
        4: ("Bengaluru", 12.9716, 77.5946),
        5: ("Hyderabad", 17.3850, 78.4867),
        6: ("Delhi", 28.6139, 77.2090),
    }

    profiles = []
    for user_id, primary_expertise, years_of_experience, bio, available, serves_as_resident, verification_status, avg_rating, total_jobs in [
        (2, "Plumbing", 8, "Experienced plumber for leak and pipe work", 1, 1, "VERIFIED", 4.8, 154),
        (3, "Electrical", 6, "Residential electrician", 1, 0, "VERIFIED", 4.6, 98),
        (4, "Carpentry", 5, "Furniture and woodwork specialist", 0, 1, "PENDING", 4.3, 65),
        (5, "HVAC", 10, "Air conditioning technician", 1, 0, "VERIFIED", 4.9, 201),
        (6, "Locksmith", 4, "Emergency lock repair expert", 1, 1, "VERIFIED", 4.5, 51),
    ]:
        city, latitude, longitude = expert_locations[user_id]
        route = shard_router.route_for_point(latitude, longitude)
        profiles.append(
            (
                user_id,
                primary_expertise,
                years_of_experience,
                bio,
                available,
                serves_as_resident,
                verification_status,
                avg_rating,
                total_jobs,
                city,
                latitude,
                longitude,
                route.region_bucket,
                route.shard_id,
                "2026-04-21T00:00:00Z",
                "2026-04-21T00:00:00Z",
            )
        )
    _execute_many(
        connection,
        """
        INSERT INTO expert_profiles
        (user_id, primary_expertise, years_of_experience, bio, is_available, serves_as_resident, verification_status, avg_rating, total_jobs, city, latitude, longitude, region_bucket, shard_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        profiles,
    )

    expertise = [
        (2, "Leak Detection"),
        (2, "Pipe Repair"),
        (2, "Drain Blockage"),
        (3, "Wiring"),
        (3, "MCB Tripping"),
        (3, "Appliance Repair"),
        (4, "Furniture Repair"),
        (4, "Woodwork"),
        (4, "Installation"),
        (5, "Gas Refill"),
        (5, "Filter Cleaning"),
        (5, "Compressor Check"),
        (6, "Lock Repair"),
        (6, "Security Systems"),
        (6, "Emergency Unlock"),
    ]
    _execute_many(connection, "INSERT INTO expert_expertise (user_id, skill) VALUES (?, ?)", expertise)

    metrics = [
        (2, 84.0, 91.0, 4.0, 120, "2026-04-21T00:00:00Z"),
        (3, 78.0, 86.0, 8.0, 210, "2026-04-21T00:00:00Z"),
        (4, 60.0, 74.0, 18.0, 260, "2026-04-21T00:00:00Z"),
        (5, 92.0, 96.0, 2.0, 95, "2026-04-21T00:00:00Z"),
        (6, 88.0, 89.0, 3.0, 110, "2026-04-21T00:00:00Z"),
    ]
    _execute_many(
        connection,
        """
        INSERT INTO expert_metrics
        (user_id, acceptance_rate, completion_rate, cancellation_rate, avg_response_time_sec, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        metrics,
    )
