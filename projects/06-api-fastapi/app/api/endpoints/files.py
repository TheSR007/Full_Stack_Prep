import os
import uuid
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.database import get_async_db
from app.models import User, Task, TaskAttachment
from app.schemas import TaskAttachmentResponse, SuccessResponse
from app.api.deps import get_current_user
from app.config import settings

router = APIRouter()


@router.post("/tasks/{id}/attachments", status_code=status.HTTP_201_CREATED, response_model=SuccessResponse[TaskAttachmentResponse])
async def upload_attachment(
    id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    stmt = select(Task).where(and_(Task.id == id, Task.user_id == current_user.id))
    result = await db.execute(stmt)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, unique_filename)

    # Save file asynchronously
    file_size = 0
    async with aiofiles.open(filepath, "wb") as out_file:
        while content := await file.read(1024 * 1024):
            file_size += len(content)
            await out_file.write(content)

    attachment = TaskAttachment(
        task_id=task.id,
        filename=file.filename,
        filepath=filepath,
        file_size=file_size,
        content_type=file.content_type or "application/octet-stream"
    )
    db.add(attachment)
    await db.commit()
    await db.refresh(attachment)

    attachment_resp = TaskAttachmentResponse(
        id=attachment.id,
        filename=attachment.filename,
        fileSize=attachment.file_size,
        contentType=attachment.content_type,
        uploadedAt=attachment.uploaded_at.isoformat() if attachment.uploaded_at else None
    )

    return SuccessResponse(data=attachment_resp)


@router.get("/files/download/{file_id}")
async def download_file(
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    stmt = select(TaskAttachment).join(Task).where(
        and_(TaskAttachment.id == file_id, Task.user_id == current_user.id)
    )
    result = await db.execute(stmt)
    attachment = result.scalar_one_or_none()

    if not attachment or not os.path.exists(attachment.filepath):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File attachment not found")

    return FileResponse(
        path=attachment.filepath,
        filename=attachment.filename,
        media_type=attachment.content_type
    )
