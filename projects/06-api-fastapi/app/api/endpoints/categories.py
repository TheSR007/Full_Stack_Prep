from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_async_db
from app.models import User, Task
from app.schemas import SuccessResponse
from app.api.deps import get_current_user

router = APIRouter()


@router.get("", response_model=SuccessResponse[List[str]])
async def list_categories(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    stmt = select(Task.category).where(Task.user_id == current_user.id).distinct()
    result = await db.execute(stmt)
    raw_categories = result.scalars().all()

    categories_set = set()
    for cat in raw_categories:
        if cat and cat.strip():
            categories_set.add(cat.strip())

    sorted_categories = sorted(list(categories_set), key=lambda s: s.lower())

    return SuccessResponse(data=sorted_categories)
