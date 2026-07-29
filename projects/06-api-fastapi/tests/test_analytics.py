import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_analytics_metrics(client: AsyncClient, auth_headers: dict):
    await client.post("/api/v1/tasks", json={"title": "Analytics 1", "status": "completed", "priority": "urgent"}, headers=auth_headers)
    await client.post("/api/v1/tasks", json={"title": "Analytics 2", "status": "in_progress", "priority": "medium"}, headers=auth_headers)

    res = await client.get("/api/v1/analytics", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["totalTasks"] == 2
    assert data["completedTasks"] == 1
    assert data["inProgressTasks"] == 1
    assert data["urgentTasks"] == 1
    assert data["completionRate"] == 50.0
