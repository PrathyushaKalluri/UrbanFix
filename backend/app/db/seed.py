from __future__ import annotations

from typing import Iterable, Sequence

from ..core.sharding import SpatialShardRouter
from ..core.security import hash_password
from .repository import Repository


def _execute_many(connection, sql: str, rows: Sequence[Sequence[object]]) -> None:
    connection.executemany(sql, rows)


def seed_demo_data(connection) -> None:
    import pandas as pd
    import os
    repo = Repository(connection)
    if repo.fetchone("SELECT COUNT(*) AS count FROM users")['count']:
        return

    # Paths to CSVs (adjust if needed)
    csv_dir = os.path.expanduser(r'C:/Users/ASUS/Downloads')
    users_csv = os.path.join(csv_dir, 'users.csv')
    expert_profiles_csv = os.path.join(csv_dir, 'expert_profiles.csv')
    expert_expertise_csv = os.path.join(csv_dir, 'expert_expertise.csv')

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
        profiles_rows.append((
            row['user_id'],
            row['primary_expertise'],
            row['years_of_experience'],
            row['bio'],
            int(row['available']),
            int(row['serves_as_resident']),
            'VERIFIED', # or row.get('verification_status', 'VERIFIED')
            0.0, # avg_rating default
            0,   # total_jobs default
            None, # city
            None, # latitude
            None, # longitude
            None, # region_bucket
            None, # shard_id
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
