from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    app_name: str = os.getenv("APP_NAME", "UrbanFix API")
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./urbanfix.db")
    cache_backend: str = os.getenv("CACHE_BACKEND", "in-memory")
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    redis_key_prefix: str = os.getenv("REDIS_KEY_PREFIX", "urbanfix:")
    rate_limit_backend: str = os.getenv("RATE_LIMIT_BACKEND", "redis")
    rate_limit_window_seconds: int = int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "60"))
    login_rate_limit: int = int(os.getenv("LOGIN_RATE_LIMIT", "10"))
    register_rate_limit: int = int(os.getenv("REGISTER_RATE_LIMIT", "6"))
    search_rate_limit: int = int(os.getenv("SEARCH_RATE_LIMIT", "120"))
    match_rate_limit: int = int(os.getenv("MATCH_RATE_LIMIT", "30"))
    job_rate_limit: int = int(os.getenv("JOB_RATE_LIMIT", "20"))
    expert_list_cache_ttl_seconds: int = int(os.getenv("EXPERT_LIST_CACHE_TTL_SECONDS", "60"))
    matching_cache_ttl_seconds: int = int(os.getenv("MATCHING_CACHE_TTL_SECONDS", "120"))
    default_page_size: int = int(os.getenv("DEFAULT_PAGE_SIZE", "20"))
    max_page_size: int = int(os.getenv("MAX_PAGE_SIZE", "100"))
    shard_count: int = int(os.getenv("SHARD_COUNT", "16"))
    shard_cell_degrees: float = float(os.getenv("SHARD_CELL_DEGREES", "1.0"))
    shard_db_directory: str = os.getenv("SHARD_DB_DIRECTORY", "./shards")
    queue_backend: str = os.getenv("QUEUE_BACKEND", "redis-streams")
    queue_stream_name: str = os.getenv("QUEUE_STREAM_NAME", "urbanfix:jobs")
    queue_consumer_group: str = os.getenv("QUEUE_CONSUMER_GROUP", "urbanfix-workers")
    queue_consumer_name: str = os.getenv("QUEUE_CONSUMER_NAME", "worker-1")
    queue_poll_timeout_ms: int = int(os.getenv("QUEUE_POLL_TIMEOUT_MS", "1000"))
    queue_batch_size: int = int(os.getenv("QUEUE_BATCH_SIZE", "10"))
    jwt_secret: str = os.getenv("JWT_SECRET", "urbanfix-dev-secret-change-me")
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    jwt_expiration_minutes: int = int(os.getenv("JWT_EXPIRATION_MINUTES", "1440"))
    cors_origins: tuple[str, ...] = tuple(
        origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if origin.strip()
    )
    seed_demo_data: bool = os.getenv("SEED_DEMO_DATA", "true").lower() in {"1", "true", "yes", "on"}


settings = Settings()
