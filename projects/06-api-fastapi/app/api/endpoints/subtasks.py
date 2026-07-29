from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.database import get_async_db
from app.models import User, Task, Subtask, TaskHistory
from app.schemas import SubtaskCreate, SubtaskUpdate, SubtaskResponse, SuccessResponse
from app.api.deps import get_current_user

router = APIRouter()


@router.post("/{id}/subtasks", status_code=status.HTTP_201_CREATED, response_model=SuccessResponse[SubtaskResponse])
async def create_subtask(
    id: str,
    req: SubtaskCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    stmt = select(Task).where(and_(Task.id == id, Task.user_id == current_user.id))
    result = await db.execute(stmt)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    subtask = Subtask(task_id=task.id, title=req.title)
    db.add(subtask)

    history = TaskHistory(task_id=task.id, text=f"Subtask added: '{req.title}'")
    db.add(history)

    await db.commit()
    await db.refresh(subtask)

    sub_resp = SubtaskResponse(
        id=subtask.id,
        taskId=subtask.task_id,
        title=subtask.title,
        completed=subtask.completed,
        createdAt=subtask.created_at.isoformat() if subtask.created_at else None,
        updatedAt=subtask.updated_at.isoformat() if subtask.updated_at else None
    )

    return SuccessResponse(data=sub_resp)


@router.patch("/{id}/subtasks/{subtaskId}", response_model=SuccessResponse[SubtaskResponse])
async def update_subtask(
    id: str,
    subtaskId: str,
    req: SubtaskUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    stmt = select(Task).where(and_(Task.id == id, Task.user_id == current_user.id))
    result = await db.execute(stmt)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    sub_stmt = select(Subtask).where(and_(Subtask.id == subtaskId, Subtask.task_id == task.id))
    sub_result = await db.execute(sub_stmt)
    subtask = sub_result.scalar_one_or_none()

    if not subtask:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subtask not found")

    if req.completed is not None:
        subtask.completed = req.completed
        status_str = "completed" if req.completed else "uncompleted"
        history = TaskHistory(task_id=task.id, text=f"Subtask '{subtask.title}' marked as {status_str}")
        db.add(history)

    if req.title is not None:
        subtask.title = req.title

    await db.commit()
    await db.refresh(subtask)

    sub_resp = SubtaskResponse(
        id=subtask.id,
        taskId=subtask.task_id,
        title=subtask.title,
        completed=subtask.completed,
        createdAt=subtask.created_at.isoformat() if subtask.created_at else None,
        updatedAt=subtask.updated_at.isoformat() if subtask.updated_at else None
    )

    return SuccessResponse(data=sub_resp)


@router.delete("/{id}/subtasks/{subtaskId}", response_model=SuccessResponse[dict])
async def delete_subtask(
    id: str,
    subtaskId: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    stmt = select(Task).where(and_(Task.id == id, Task.user_id == current_user.id))
    result = await db.execute(stmt)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    sub_stmt = select(Subtask).where(and_(Subtask.id == subtaskId, Subtask.task_id == task.id))
    sub_result = await db.execute(sub_stmt)
    subtask = sub_result.scalar_one_or_none()

    if not subtask:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subtask not found")

    await db.delete(subtask)
    await db.commit()

    return SuccessResponse(data={"id": subtaskId, "message": "Subtask deleted"})
