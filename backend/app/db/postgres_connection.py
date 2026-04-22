from __future__ import annotations

from contextlib import contextmanager
from typing import Iterator

from psycopg import Connection, connect
from psycopg.rows import dict_row

from ..core.config import settings


def open_postgres_connection() -> Connection:
    return connect(settings.postgres_dsn, row_factory=dict_row)


@contextmanager
def postgres_session() -> Iterator[Connection]:
    connection = open_postgres_connection()
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()