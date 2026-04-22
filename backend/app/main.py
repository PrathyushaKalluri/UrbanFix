from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.cache import create_cache_provider
from .core.config import settings
from .core.job_queue import QueueWorker, create_job_queue
from .core.rate_limiter import create_rate_limiter
from .core.sharding import SpatialShardRouter
from .core.shard_store import ShardExpertStore
from .db.connection import db_session, initialize_database
from .db.repository import Repository
from .db.seed import ensure_expert_geodata, seed_demo_data
from .routers.auth import router as auth_router
from .routers.experts import router as experts_router
from .routers.health import router as health_router
from .routers.jobs import router as jobs_router
from .routers.notifications import router as notifications_router
from .routers.matching import router as matching_router
from .services.job_service import JobService

@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_runtime()
    try:
        yield
    finally:
        shutdown_runtime()


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(experts_router)
app.include_router(matching_router)
app.include_router(jobs_router)
app.include_router(notifications_router)


def initialize_runtime() -> None:
    if getattr(app.state, "bootstrapped", False):
        return

    app.state.cache_provider = create_cache_provider(settings)
    app.state.rate_limiter = create_rate_limiter(settings)
    app.state.job_queue = create_job_queue(settings)
    app.state.shard_router = SpatialShardRouter(settings.shard_count, settings.shard_cell_degrees)
    app.state.shard_store = ShardExpertStore(shard_count=settings.shard_count, shard_db_directory=settings.shard_db_directory)
    app.state.shard_store.initialize()
    bootstrap_database()
    sync_shard_store()
    job_service = JobService(app.state.shard_router, app.state.cache_provider, app.state.shard_store)
    app.state.job_worker = QueueWorker(
        queue_backend=app.state.job_queue,
        handler=job_service.process_queue_message,
        batch_size=settings.queue_batch_size,
        poll_timeout_ms=settings.queue_poll_timeout_ms,
    )
    app.state.job_worker.start()
    app.state.bootstrapped = True


def shutdown_runtime() -> None:
    job_worker = getattr(app.state, "job_worker", None)
    if job_worker is not None:
        job_worker.stop()
        app.state.job_worker = None
    job_queue = getattr(app.state, "job_queue", None)
    if job_queue is not None:
        job_queue.close()
        app.state.job_queue = None
    cache_provider = getattr(app.state, "cache_provider", None)
    if cache_provider is not None:
        cache_provider.close()
        app.state.cache_provider = None
    app.state.bootstrapped = False


def bootstrap_database() -> None:
    initialize_database()
    with db_session() as connection:
        if settings.seed_demo_data:
            seed_demo_data(connection)
        ensure_expert_geodata(connection, app.state.shard_router)


def sync_shard_store() -> None:
    with db_session() as connection:
        repository = Repository(connection)
        rows = repository.expert_rows(available_only=False)
    store_rows = []
    for row in rows:
        store_rows.append(
            {
                "expert_id": row.expert_id,
                "user_id": row.user_id,
                "full_name": row.full_name,
                "email": row.email,
                "primary_expertise": row.primary_expertise,
                "years_of_experience": row.years_of_experience,
                "bio": row.bio,
                "available": row.available,
                "serves_as_resident": row.serves_as_resident,
                "expertise_areas": row.expertise_areas,
                "avg_rating": row.avg_rating,
                "total_jobs": row.total_jobs,
                "acceptance_rate": row.acceptance_rate,
                "completion_rate": row.completion_rate,
                "cancellation_rate": row.cancellation_rate,
                "avg_response_time_sec": row.avg_response_time_sec,
                "latitude": row.latitude,
                "longitude": row.longitude,
                "city": row.city,
                "region_bucket": row.region_bucket,
                "shard_id": row.shard_id,
            }
        )
    app.state.shard_store.sync_from_rows(store_rows)


initialize_runtime()
