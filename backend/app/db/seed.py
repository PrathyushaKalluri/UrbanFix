from __future__ import annotations

from .repository import Repository


def seed_demo_data(connection) -> None:
    repo = Repository(connection)
    shard_router = SpatialShardRouter(settings.shard_count, settings.shard_cell_degrees)
    if repo.fetchone("SELECT COUNT(*) AS count FROM users")['count']:
        return
    return
