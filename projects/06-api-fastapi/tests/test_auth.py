import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_user(client: AsyncClient):
    payload = {
        "email": "newdev@taskflow.dev",
        "password": "SecurePassword123!",
        "name": "New Dev"
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["user"]["email"] == "newdev@taskflow.dev"
    assert "accessToken" in data["data"]
    assert "refreshToken" in response.cookies


@pytest.mark.asyncio
async def test_login_user(client: AsyncClient):
    # Register first
    register_payload = {
        "email": "loginuser@taskflow.dev",
        "password": "SecurePassword123!",
        "name": "Login User"
    }
    await client.post("/api/v1/auth/register", json=register_payload)

    # Login
    login_payload = {
        "email": "loginuser@taskflow.dev",
        "password": "SecurePassword123!"
    }
    response = await client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "accessToken" in data["data"]


@pytest.mark.asyncio
async def test_get_me(client: AsyncClient, auth_headers: dict):
    response = await client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["email"] == "testuser@taskflow.dev"
