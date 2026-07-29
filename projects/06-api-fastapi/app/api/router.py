from fastapi import APIRouter
from app.api.endpoints import auth, tasks, subtasks, categories, analytics, files, websocket

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
api_router.include_router(subtasks.router, prefix="/tasks", tags=["Subtasks"])
api_router.include_router(categories.router, prefix="/categories", tags=["Categories"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(files.router, tags=["Files"])
api_router.include_router(websocket.router, tags=["WebSockets"])
