import pytest
from fastapi.testclient import TestClient
from main import app, JobPayload

client = TestClient(app)

def test_job_payload_validation():
    # Unit test for Pydantic schema validation logic
    job = JobPayload(title="Data Processing Task", task_type="ETL")
    assert job.title == "Data Processing Task"
    assert job.task_type == "ETL"
    assert job.payload is None

def test_healthz_endpoint():
    # Unit test for healthz endpoint logic
    response = client.get("/healthz")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "api-fastapi-worker"

def test_metrics_endpoint():
    # Unit test for Prometheus telemetry endpoint
    response = client.get("/metrics")
    assert response.status_code == 200
    assert "jobs_processed_total" in response.text

def test_get_jobs_function_logic():
    # Unit test for /jobs endpoint fallback & listing logic without DB
    response = client.get("/jobs")
    assert response.status_code == 200
    data = response.json()
    assert "count" in data
    assert "jobs" in data
    assert isinstance(data["jobs"], list)
    assert len(data["jobs"]) >= 1

def test_create_job_function_logic():
    # Unit test for /jobs POST endpoint logic without DB
    payload = {"title": "Unit Test Async Job", "task_type": "UNIT_TEST"}
    response = client.post("/jobs", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Unit Test Async Job"
    assert data["status"] == "QUEUED"
    assert "id" in data