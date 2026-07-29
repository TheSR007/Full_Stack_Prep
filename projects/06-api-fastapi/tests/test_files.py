import pytest
import io
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_file_upload_and_download(client: AsyncClient, auth_headers: dict):
    # Create Task
    task_res = await client.post("/api/v1/tasks", json={"title": "Task for Upload"}, headers=auth_headers)
    task_id = task_res.json()["data"]["id"]

    # Upload File
    file_content = b"Sample text content for task attachment test"
    files = {"file": ("test_doc.txt", io.BytesIO(file_content), "text/plain")}

    upload_res = await client.post(f"/api/v1/tasks/{task_id}/attachments", files=files, headers=auth_headers)
    assert upload_res.status_code == 201
    file_id = upload_res.json()["data"]["id"]
    assert upload_res.json()["data"]["filename"] == "test_doc.txt"

    # Download File
    dl_res = await client.get(f"/api/v1/files/download/{file_id}", headers=auth_headers)
    assert dl_res.status_code == 200
    assert dl_res.content == file_content
