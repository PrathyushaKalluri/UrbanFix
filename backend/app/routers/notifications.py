from __future__ import annotations

from fastapi import APIRouter, Depends

from ..core.config import settings
from ..schemas.notification import NotificationItem, NotificationPage
from ..services.job_service import JobService
from .dependencies import build_rate_limit_dependency, get_current_user_dependency, get_shard_router_dependency

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get(
    "",
    response_model=NotificationPage,
    dependencies=[Depends(build_rate_limit_dependency("notifications.list", settings.search_rate_limit, settings.rate_limit_window_seconds))],
)
def list_notifications(current_user=Depends(get_current_user_dependency), shard_router=Depends(get_shard_router_dependency)) -> NotificationPage:
    service = JobService(shard_router)
    items = service.list_notifications(current_user.user_id)
    return NotificationPage(items=[NotificationItem(**item) for item in items])
