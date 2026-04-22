from __future__ import annotations

import os
import random
from pathlib import Path
from typing import Sequence

from ..core.sharding import SpatialShardRouter
from ..core.config import settings
from .repository import Repository


def _execute_many(connection, sql: str, rows: Sequence[Sequence[object]]) -> None:
    connection.executemany(sql, rows)


HYDERABAD_AREAS: tuple[tuple[str, float, float], ...] = (
    ("Madhapur", 17.4483, 78.3915),
    ("Gachibowli", 17.4401, 78.3489),
    ("Hitech City", 17.4435, 78.3772),
    ("Kukatpally", 17.4933, 78.4011),
    ("Ameerpet", 17.4374, 78.4482),
    ("Banjara Hills", 17.4138, 78.4398),
    ("Jubilee Hills", 17.4326, 78.4071),
    ("Begumpet", 17.4440, 78.4627),
    ("Secunderabad", 17.4399, 78.4983),
    ("Mehdipatnam", 17.3959, 78.4331),
)


def _geo_for_user_id(user_id: int) -> tuple[str, float, float]:
    area_name, base_lat, base_lon = HYDERABAD_AREAS[user_id % len(HYDERABAD_AREAS)]
    rng = random.Random(user_id)
    lat = base_lat + rng.uniform(-0.015, 0.015)
    lon = base_lon + rng.uniform(-0.015, 0.015)
    return area_name, lat, lon


def _resolve_csv_dir() -> Path:
    # Optional override for CI or custom local setups.
    env_dir = os.getenv("SEED_CSV_DIR")
    if env_dir:
        path = Path(env_dir).expanduser().resolve()
        if path.exists():
            return path

    seed_file = Path(__file__).resolve()
    candidates = [
        seed_file.parents[4],  # workspace root (contains users.csv in this project)
        seed_file.parents[3],  # UrbanFix/
        seed_file.parents[2],  # backend/
    ]
    for candidate in candidates:
        if (candidate / "users.csv").exists():
            return candidate

    return candidates[0]


def seed_demo_data(connection) -> None:
    import pandas as pd

    repo = Repository(connection)
    shard_router = SpatialShardRouter(settings.shard_count, settings.shard_cell_degrees)
    if repo.fetchone("SELECT COUNT(*) AS count FROM users")['count']:
        return

    csv_dir = _resolve_csv_dir()
    users_csv = csv_dir / "users.csv"
    expert_profiles_csv = csv_dir / "expert_profiles.csv"
    expert_expertise_csv = csv_dir / "expert_expertise.csv"

    missing_files = [str(path) for path in (users_csv, expert_profiles_csv, expert_expertise_csv) if not path.exists()]
    if missing_files:
        raise FileNotFoundError(f"Seed CSV files are missing: {', '.join(missing_files)}")

    # USERS
    users_df = pd.read_csv(users_csv)
    users_rows = []
    roles_rows = []
    for _, row in users_df.iterrows():
        users_rows.append((row['id'], row['full_name'], row['email'], None, row['password'], '2026-04-21T00:00:00Z', '2026-04-21T00:00:00Z'))
        roles_rows.append((row['id'], row['role']))
    _execute_many(
        connection,
        "INSERT INTO users (id, full_name, email, phone, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        users_rows,
    )
    _execute_many(connection, "INSERT INTO user_roles (user_id, role) VALUES (?, ?)", roles_rows)

    # EXPERT PROFILES
    profiles_df = pd.read_csv(expert_profiles_csv)
    profiles_rows = []
    for _, row in profiles_df.iterrows():
        user_id = int(row['user_id'])
        city, latitude, longitude = _geo_for_user_id(user_id)
        route = shard_router.route_for_point(latitude, longitude, radius_km=0.0)
        profiles_rows.append((
            user_id,
            row['primary_expertise'],
            row['years_of_experience'],
            row['bio'],
            int(row['available']),
            int(row['serves_as_resident']),
            'VERIFIED', # or row.get('verification_status', 'VERIFIED')
            0.0, # avg_rating default
            0,   # total_jobs default
            city,
            latitude,
            longitude,
            route.region_bucket,
            route.shard_id,
            '2026-04-21T00:00:00Z',
            '2026-04-21T00:00:00Z',
        ))
    _execute_many(
        connection,
        """
        INSERT INTO expert_profiles
        (user_id, primary_expertise, years_of_experience, bio, is_available, serves_as_resident, verification_status, avg_rating, total_jobs, city, latitude, longitude, region_bucket, shard_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        profiles_rows,
    )

    # EXPERT EXPERTISE
    expertise_df = pd.read_csv(expert_expertise_csv)
    profile_id_to_user_id = {row['id']: row['user_id'] for _, row in profiles_df.iterrows()}
    
    expertise_rows = []
    for _, row in expertise_df.iterrows():
        # The CSV has expert_profile_id and expertise (comma-separated)
        user_id = profile_id_to_user_id.get(row['expert_profile_id'])
        if not user_id:
            continue
        for skill in str(row['expertise']).split(','):
            if skill.strip():
                expertise_rows.append((user_id, skill.strip()))
    _execute_many(connection, "INSERT INTO expert_expertise (user_id, skill) VALUES (?, ?)", expertise_rows)


def ensure_expert_geodata(connection, shard_router: SpatialShardRouter | None = None) -> int:
    router = shard_router or SpatialShardRouter(settings.shard_count, settings.shard_cell_degrees)
    rows = connection.execute(
        """
        SELECT user_id
        FROM expert_profiles
        WHERE latitude IS NULL
           OR longitude IS NULL
           OR region_bucket IS NULL
           OR shard_id IS NULL
           OR city IS NULL
        """
    ).fetchall()
    if not rows:
        return 0

    updates: list[tuple[object, ...]] = []
    for row in rows:
        user_id = int(row[0])
        city, latitude, longitude = _geo_for_user_id(user_id)
        route = router.route_for_point(latitude, longitude, radius_km=0.0)
        updates.append((city, latitude, longitude, route.region_bucket, route.shard_id, user_id))

    connection.executemany(
        """
        UPDATE expert_profiles
           SET city = ?,
               latitude = ?,
               longitude = ?,
               region_bucket = ?,
               shard_id = ?
         WHERE user_id = ?
        """,
        updates,
    )
    return len(updates)
