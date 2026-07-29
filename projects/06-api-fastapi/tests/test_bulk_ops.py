import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_bulk_status_update_and_delete(client: AsyncClient, auth_headers: dict):
    t1 = (await client.post("/api/v1/tasks", json={"title": "Bulk 1"}, headers=auth_headers)).json()["data"]["id"]
    t2 = (await client.post("/api/v1/tasks", json={"title": "Bulk 2"}, headers=auth_headers)).json()["data"]["id"]

    # Bulk status update
    bulk_patch = await client.patch("/api/v1/tasks/bulk-update-status", json={"taskIds": [t1, t2], "status": "completed"}, headers=auth_headers)
    assert bulk_patch.status_code == 200
    assert bulk_patch.json()["data"]["count"] == 2

    # Bulk delete
    bulk_del = await client.post("/api/v1/tasks/bulk-delete", json={"taskIds": [t1, t2]}, headers=auth_headers)
    assert bulk_del.status_code == 200
    assert bulk_del.json()["data"]["count"] == 2
