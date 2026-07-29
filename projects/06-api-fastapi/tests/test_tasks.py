import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_and_get_task(client: AsyncClient, auth_headers: dict):
    payload = {
        "title": "Build FastAPI Test Endpoint",
        "description": "Implement task CRUD endpoint with validation.",
        "status": "in_progress",
        "priority": "high",
        "category": "Backend",
        "tags": ["#fastapi", "#python"],
        "dueDate": "2026-08-01"
    }

    create_res = await client.post("/api/v1/tasks", json=payload, headers=auth_headers)
    assert create_res.status_code == 201
    task_data = create_res.json()["data"]
    assert task_data["title"] == "Build FastAPI Test Endpoint"

    task_id = task_data["id"]
    get_res = await client.get(f"/api/v1/tasks/{task_id}", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["data"]["id"] == task_id


@pytest.mark.asyncio
async def test_list_tasks_filtering(client: AsyncClient, auth_headers: dict):
    # Seed 2 tasks
    t1 = {"title": "Task 1", "category": "Backend", "status": "todo", "priority": "low"}
    t2 = {"title": "Task 2", "category": "Frontend", "status": "completed", "priority": "urgent"}
    await client.post("/api/v1/tasks", json=t1, headers=auth_headers)
    await client.post("/api/v1/tasks", json=t2, headers=auth_headers)

    res = await client.get("/api/v1/tasks?category=Backend", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["meta"]["total"] == 1
    assert data["data"][0]["title"] == "Task 1"
