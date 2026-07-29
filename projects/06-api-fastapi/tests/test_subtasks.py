import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_subtask_lifecycle(client: AsyncClient, auth_headers: dict):
    # Create Task
    task_res = await client.post("/api/v1/tasks", json={"title": "Parent Task"}, headers=auth_headers)
    task_id = task_res.json()["data"]["id"]

    # Create Subtask
    sub_res = await client.post(f"/api/v1/tasks/{task_id}/subtasks", json={"title": "Subtask 1"}, headers=auth_headers)
    assert sub_res.status_code == 201
    sub_id = sub_res.json()["data"]["id"]
    assert sub_res.json()["data"]["completed"] is False

    # Update Subtask to Completed
    patch_res = await client.patch(f"/api/v1/tasks/{task_id}/subtasks/{sub_id}", json={"completed": True}, headers=auth_headers)
    assert patch_res.status_code == 200
    assert patch_res.json()["data"]["completed"] is True

    # Delete Subtask
    del_res = await client.delete(f"/api/v1/tasks/{task_id}/subtasks/{sub_id}", headers=auth_headers)
    assert del_res.status_code == 200
