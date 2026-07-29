import pytest
from app.main import app
from starlette.testclient import TestClient


def test_websocket_endpoint():
    client = TestClient(app)
    with client.websocket_connect("/api/v1/ws/tasks") as websocket:
        websocket.send_json({"type": "ping"})
        data = websocket.receive_json()
        assert data["status"] == "received"
        assert data["data"] == {"type": "ping"}
