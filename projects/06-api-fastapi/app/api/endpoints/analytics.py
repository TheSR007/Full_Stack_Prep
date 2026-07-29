from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.database import get_async_db
from app.models import User, Task
from app.schemas import AnalyticsData, VelocityMetrics, PriorityDistribution, SuccessResponse
from app.api.deps import get_current_user

router = APIRouter()


@router.get("", response_model=SuccessResponse[AnalyticsData])
async def get_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    stmt = select(Task).where(Task.user_id == current_user.id)
    result = await db.execute(stmt)
    tasks = result.scalars().all()

    total_tasks = len(tasks)
    completed_tasks = sum(1 for t in tasks if t.status == "completed")
    in_progress_tasks = sum(1 for t in tasks if t.status == "in_progress")
    urgent_tasks = sum(1 for t in tasks if t.priority == "urgent")

    completion_rate = round((completed_tasks / total_tasks * 100), 2) if total_tasks > 0 else 0.0

    # Calculate weekly velocity (tasks updated/completed in the last 7 days)
    one_week_ago = datetime.utcnow() - timedelta(days=7)
    completed_this_week = sum(
        1 for t in tasks
        if t.status == "completed" and t.updated_at and t.updated_at >= one_week_ago
    )

    priority_dist = PriorityDistribution(
        low=sum(1 for t in tasks if t.priority == "low"),
        medium=sum(1 for t in tasks if t.priority == "medium"),
        high=sum(1 for t in tasks if t.priority == "high"),
        urgent=urgent_tasks
    )

    velocity = VelocityMetrics(
        completedThisWeek=completed_this_week,
        trend="up" if completed_this_week > 0 else "stable"
    )

    analytics_data = AnalyticsData(
        totalTasks=total_tasks,
        completedTasks=completed_tasks,
        inProgressTasks=in_progress_tasks,
        urgentTasks=urgent_tasks,
        completionRate=completion_rate,
        velocity=velocity,
        priorityDistribution=priority_dist
    )

    return SuccessResponse(data=analytics_data)
