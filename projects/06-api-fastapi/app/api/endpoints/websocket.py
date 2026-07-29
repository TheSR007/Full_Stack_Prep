from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.websocket_manager import ws_manager

router = APIRouter()


@router.websocket("/ws/tasks")
async def websocket_tasks_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            # Echo or process incoming socket messages
            await ws_manager.send_personal_message({"status": "received", "data": data}, websocket)
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
