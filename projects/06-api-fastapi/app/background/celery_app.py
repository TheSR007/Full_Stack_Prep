from celery import Celery
from app.config import settings

celery_app = Celery(
    "tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Dhaka",
    enable_utc=True,
)


@celery_app.task(name="process_task_notification")
def process_task_notification(task_id: str, action: str) -> str:
    # Simulated background notification task
    return f"Notification processed for task {task_id} on action {action}"
