from __future__ import annotations

import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

from ..core.config import settings

BASE_DIR = Path(__file__).resolve().parents[2]
SQLITE_PATH = BASE_DIR / "urbanfix.db"
SCHEMA_PATH = BASE_DIR / "sql" / "schema.sql"


def _resolve_sqlite_path() -> Path:
    if settings.database_url.startswith("sqlite:///"):
        raw = settings.database_url.replace("sqlite:///", "", 1)
        path = Path(raw)
        if not path.is_absolute():
            path = (BASE_DIR / path).resolve()
        return path
    return SQLITE_PATH


def open_connection() -> sqlite3.Connection:
    path = _resolve_sqlite_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


@contextmanager
def db_session() -> Iterator[sqlite3.Connection]:
    connection = open_connection()
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def initialize_database() -> None:
    schema_sql = SCHEMA_PATH.read_text(encoding="utf-8")
    statements = [statement.strip() for statement in schema_sql.split(";") if statement.strip()]

    with db_session() as connection:
        for statement in statements:
            connection.execute(statement)
        _ensure_columns(connection)


def _ensure_columns(connection: sqlite3.Connection) -> None:
    existing_columns = {row[1] for row in connection.execute("PRAGMA table_info(expert_profiles)").fetchall()}
    expert_profile_columns = [
        ("city", "VARCHAR(120)"),
        ("latitude", "REAL"),
        ("longitude", "REAL"),
        ("region_bucket", "VARCHAR(64)"),
        ("shard_id", "INTEGER"),
    ]
    for column_name, column_type in expert_profile_columns:
        if column_name not in existing_columns:
            connection.execute(f"ALTER TABLE expert_profiles ADD COLUMN {column_name} {column_type}")

    async_jobs_columns = {row[1] for row in connection.execute("PRAGMA table_info(async_jobs)").fetchall()}
    if not async_jobs_columns:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS async_jobs (
              job_id VARCHAR(64) PRIMARY KEY,
              job_type VARCHAR(80) NOT NULL,
              status VARCHAR(30) NOT NULL,
              user_id INTEGER,
              payload_json TEXT NOT NULL,
              result_json TEXT,
              error_message TEXT,
              region_bucket VARCHAR(64),
              shard_id INTEGER,
              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

    notifications_columns = {row[1] for row in connection.execute("PRAGMA table_info(notifications)").fetchall()}
    if not notifications_columns:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS notifications (
              notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id INTEGER NOT NULL,
              channel VARCHAR(30) NOT NULL DEFAULT 'IN_APP',
              title VARCHAR(160) NOT NULL,
              body TEXT NOT NULL,
              payload_json TEXT NOT NULL,
              is_read BOOLEAN NOT NULL DEFAULT 0,
              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
              read_at TIMESTAMP
            )
            """
        )
