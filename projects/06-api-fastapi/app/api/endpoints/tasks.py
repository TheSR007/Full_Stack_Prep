import math
from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_, update, delete
from app.database import get_async_db
from app.models import User, Task, TaskHistory
from app.schemas import (
    TaskCreate, TaskUpdate, TaskResponse, SubtaskResponse, TaskHistoryResponse, TaskAttachmentResponse,
    SuccessResponse, PaginatedResponse, PaginatedMeta, BulkDeleteRequest, BulkDeleteData,
    BulkStatusUpdateRequest, BulkStatusUpdateData
)
from app.api.deps import get_current_user
from app.core.websocket_manager import ws_manager

router = APIRouter()


def format_task_response(task: Task) -> TaskResponse:
    subtasks = [
        SubtaskResponse(
            id=st.id,
            taskId=st.task_id,
            title=st.title,
            completed=st.completed,
            createdAt=st.created_at.isoformat() if st.created_at else None,
            updatedAt=st.updated_at.isoformat() if st.updated_at else None
        )
        for st in getattr(task, "subtasks", [])
    ]

    history = [
        TaskHistoryResponse(
            id=h.id,
            text=h.text,
            timestamp=h.timestamp.isoformat() if h.timestamp else None
        )
        for h in getattr(task, "history", [])
    ]

    attachments = [
        TaskAttachmentResponse(
            id=att.id,
            filename=att.filename,
            fileSize=att.file_size,
            contentType=att.content_type,
            uploadedAt=att.uploaded_at.isoformat() if att.uploaded_at else None
        )
        for att in getattr(task, "attachments", [])
    ]

    return TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description or "",
        status=task.status,
        priority=task.priority,
        category=task.category,
        tags=task.tags or [],
        dueDate=task.due_date,
        createdAt=task.created_at.isoformat() if task.created_at else datetime.utcnow().isoformat(),
        updatedAt=task.updated_at.isoformat() if task.updated_at else datetime.utcnow().isoformat(),
        subtasks=subtasks,
        history=history,
        attachments=attachments
    )


@router.get("", response_model=PaginatedResponse[TaskResponse])
async def list_tasks(
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    sortBy: str = Query("createdAt"),
    sortOrder: str = Query("desc"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    query = select(Task).where(Task.user_id == current_user.id)

    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            or_(
                Task.title.ilike(search_pattern),
                Task.description.ilike(search_pattern)
            )
        )

    if status_filter and status_filter.lower() != "all":
        query = query.where(Task.status == status_filter.lower())

    if priority and priority.lower() != "all":
        query = query.where(Task.priority == priority.lower())

    if category and category.lower() != "all":
        query = query.where(Task.category.ilike(category))

    # Count Total
    count_stmt = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_stmt)
    total = total_result.scalar_one()

    # Sorting
    if sortBy == "dueDate":
        sort_col = Task.due_date
    elif sortBy == "title":
        sort_col = Task.title
    else:
        sort_col = Task.created_at

    if sortOrder.lower() == "asc":
        query = query.order_by(sort_col.asc())
    else:
        query = query.order_by(sort_col.desc())

    # Pagination
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    tasks = result.scalars().all()

    total_pages = math.ceil(total / limit) if total > 0 else 0

    return PaginatedResponse(
        data=[format_task_response(t) for t in tasks],
        meta=PaginatedMeta(
            page=page,
            limit=limit,
            total=total,
            totalPages=total_pages
        )
    )


@router.post("", status_code=status.HTTP_201_CREATED, response_model=SuccessResponse[TaskResponse])
async def create_task(
    req: TaskCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    task = Task(
        user_id=current_user.id,
        title=req.title,
        description=req.description or "",
        status=req.status or "todo",
        priority=req.priority or "medium",
        category=req.category or "General",
        tags=req.tags or [],
        due_date=req.dueDate
    )
    db.add(task)
    await db.flush()

    # Log initial history
    history = TaskHistory(task_id=task.id, text="Task created")
    db.add(history)
    await db.commit()
    await db.refresh(task)

    task_resp = format_task_response(task)

    # Broadcast websocket event
    background_tasks.add_task(
        ws_manager.broadcast,
        {"event": "task_created", "data": task_resp.model_dump()}
    )

    return SuccessResponse(data=task_resp)


@router.post("/bulk-delete", response_model=SuccessResponse[BulkDeleteData])
async def bulk_delete_tasks(
    req: BulkDeleteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    if not req.taskIds:
        return SuccessResponse(data=BulkDeleteData(count=0, message="0 tasks deleted successfully"))

    stmt = delete(Task).where(and_(Task.id.in_(req.taskIds), Task.user_id == current_user.id))
    result = await db.execute(stmt)
    await db.commit()

    count = result.rowcount
    return SuccessResponse(data=BulkDeleteData(count=count, message=f"{count} tasks deleted successfully"))


@router.patch("/bulk-update-status", response_model=SuccessResponse[BulkStatusUpdateData])
async def bulk_update_status(
    req: BulkStatusUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    if not req.taskIds:
        return SuccessResponse(data=BulkStatusUpdateData(count=0, message="0 tasks updated"))

    stmt = update(Task).where(
        and_(Task.id.in_(req.taskIds), Task.user_id == current_user.id)
    ).values(status=req.status, updated_at=datetime.utcnow())

    result = await db.execute(stmt)
    await db.commit()

    count = result.rowcount
    return SuccessResponse(data=BulkStatusUpdateData(count=count, message=f"{count} tasks updated to {req.status} status"))


@router.get("/{id}", response_model=SuccessResponse[TaskResponse])
async def get_task_by_id(id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_async_db)):
    stmt = select(Task).where(and_(Task.id == id, Task.user_id == current_user.id))
    result = await db.execute(stmt)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    return SuccessResponse(data=format_task_response(task))


@router.put("/{id}", response_model=SuccessResponse[TaskResponse])
@router.patch("/{id}", response_model=SuccessResponse[TaskResponse])
async def update_task(
    id: str,
    req: TaskUpdate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    stmt = select(Task).where(and_(Task.id == id, Task.user_id == current_user.id))
    result = await db.execute(stmt)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    changes = []
    if req.title is not None and req.title != task.title:
        changes.append(f"Title changed to '{req.title}'")
        task.title = req.title
    if req.description is not None:
        task.description = req.description
    if req.status is not None and req.status != task.status:
        changes.append(f"Status changed to '{req.status}'")
        task.status = req.status
    if req.priority is not None and req.priority != task.priority:
        changes.append(f"Priority changed to '{req.priority}'")
        task.priority = req.priority
    if req.category is not None:
        task.category = req.category
    if req.tags is not None:
        task.tags = req.tags
    if req.dueDate is not None:
        task.due_date = req.dueDate

    if changes:
        history = TaskHistory(task_id=task.id, text="; ".join(changes))
        db.add(history)

    await db.commit()
    await db.refresh(task)

    task_resp = format_task_response(task)

    background_tasks.add_task(
        ws_manager.broadcast,
        {"event": "task_updated", "data": task_resp.model_dump()}
    )

    return SuccessResponse(data=task_resp)


@router.delete("/{id}", response_model=SuccessResponse[dict])
async def delete_task(
    id: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    stmt = select(Task).where(and_(Task.id == id, Task.user_id == current_user.id))
    result = await db.execute(stmt)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    await db.delete(task)
    await db.commit()

    background_tasks.add_task(
        ws_manager.broadcast,
        {"event": "task_deleted", "data": {"id": id}}
    )

    return SuccessResponse(data={"id": id, "message": "Task deleted successfully"})
