from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from app.config import settings
from app.database import engine, Base
from app.api.router import api_router
from app.core.middleware import add_process_time_header, register_exception_handlers


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables on database
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="TaskFlow Unified REST API Specification",
    version="1.0.0",
    docs_url="/api-docs",
    redoc_url="/redoc",
    openapi_url="/api-docs/openapi.json",
    lifespan=lifespan
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Middlewares
app.middleware("http")(add_process_time_header)
register_exception_handlers(app)

# Prometheus Metrics Instrumentation
Instrumentator().instrument(app).expose(app, endpoint="/metrics")

# Mount API Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    return {
        "success": True,
        "data": {
            "message": "TaskFlow FastAPI Backend Service is operational",
            "docs": "/api-docs",
            "metrics": "/metrics"
        }
    }