import os
import time
from typing import Optional
from fastapi import FastAPI, Response, HTTPException, status
from pydantic import BaseModel
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST, Counter, Gauge
import pymongo
import redis

app = FastAPI(title="FastAPI Worker Microservice")

# Prometheus Telemetry Metrics
JOBS_PROCESSED = Counter("jobs_processed_total", "Total background jobs processed")
JOBS_DISPATCHED = Counter("jobs_dispatched_total", "Total jobs dispatched to queue")
JOBS_FAILED = Counter("jobs_failed_total", "Total jobs failed during execution")
WORKERS_ACTIVE = Gauge("workers_active_gauge", "Current active worker instances")

WORKERS_ACTIVE.set(1)

# Environment configuration
MONGO_USER = os.getenv("MONGO_INITDB_ROOT_USERNAME")
MONGO_PASS = os.getenv("MONGO_INITDB_ROOT_PASSWORD")
MONGO_HOST = os.getenv("MONGO_HOST")
MONGO_PORT = os.getenv("MONGO_PORT")
MONGO_DB_NAME = os.getenv("MONGO_DB")

REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_PORT_ENV = os.getenv("REDIS_PORT")
REDIS_PORT = int(REDIS_PORT_ENV) if REDIS_PORT_ENV and REDIS_PORT_ENV.isdigit() else None

mongo_client = None
mongo_db = None
redis_client = None

if MONGO_HOST and MONGO_PORT:
    try:
        if MONGO_USER and MONGO_PASS:
            mongo_uri = f"mongodb://{MONGO_USER}:{MONGO_PASS}@{MONGO_HOST}:{MONGO_PORT}/?authSource=admin"
        else:
            mongo_uri = f"mongodb://{MONGO_HOST}:{MONGO_PORT}/"
        mongo_client = pymongo.MongoClient(mongo_uri, serverSelectionTimeoutMS=1000)
        if MONGO_DB_NAME:
            mongo_db = mongo_client[MONGO_DB_NAME]
    except Exception as e:
        print(f"MongoDB connection warning: {e}")

if REDIS_HOST and REDIS_PORT:
    try:
        redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, socket_timeout=1)
    except Exception as e:
        print(f"Redis connection warning: {e}")

class JobPayload(BaseModel):
    title: str
    task_type: str = "DATA_PROCESSING"
    payload: Optional[dict] = None

@app.get("/healthz")
def healthz():
    mongo_status = "disconnected"
    redis_status = "disconnected"

    if mongo_client:
        try:
            mongo_client.admin.command('ping')
            mongo_status = "connected"
        except Exception:
            pass

    if redis_client:
        try:
            if redis_client.ping():
                redis_status = "connected"
        except Exception:
            pass

    return {
        "status": "ok",
        "service": "api-fastapi-worker",
        "mongodb": mongo_status,
        "redis": redis_status
    }

@app.get("/metrics")
def metrics():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.get("/jobs")
def get_jobs():
    JOBS_PROCESSED.inc()
    jobs_list = []

    if mongo_db is not None:
        try:
            cursor = mongo_db.jobs.find({}, {"_id": 0}).sort("created_at", -1).limit(20)
            jobs_list = list(cursor)
        except Exception as e:
            print(f"MongoDB query failed: {e}")

    if not jobs_list:
        jobs_list = [
            {
                "id": "job_default_101",
                "title": "Initial System Telemetry Sync",
                "task_type": "TELEMETRY",
                "status": "COMPLETED",
                "created_at": time.time()
            }
        ]

    return {"count": len(jobs_list), "jobs": jobs_list}

@app.post("/jobs", status_code=status.HTTP_201_CREATED)
def create_job(job: JobPayload):
    if not job.title:
        raise HTTPException(status_code=400, detail="Job title is required")

    job_doc = {
        "id": f"job_{int(time.time() * 1000)}",
        "title": job.title,
        "task_type": job.task_type,
        "status": "QUEUED",
        "payload": job.payload or {},
        "created_at": time.time()
    }

    # Push job ID to Redis queue
    if redis_client:
        try:
            redis_client.lpush("jobs:queue", job_doc["id"])
        except Exception as e:
            print(f"Redis enqueue failed: {e}")

    # Persist job record into MongoDB
    if mongo_db is not None:
        try:
            mongo_db.jobs.insert_one(dict(job_doc))
        except Exception as e:
            print(f"MongoDB insert failed: {e}")

    JOBS_DISPATCHED.inc()
    return job_doc