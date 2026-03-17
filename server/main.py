import os
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from server.schemas.chat_schema import CreateChatRequest
from server.schemas.message_schema import AddMessageRequest

from server.services.chat_service import (
    create_chat_workflow,
    add_message_workflow,
    get_chat_state,
    generate_preview,
    update_chat_workflow
)

from server.repositories.__init__db import init_db
from server.repositories.participant_repository import update_avatar


app = FastAPI(title="Chat Meme Generator")

REPO_ROOT = Path(__file__).resolve().parent.parent
SERVER_DIR = REPO_ROOT / "server"
UPLOADS_DIR = SERVER_DIR / "static" / "uploads"


def _parse_cors_origins() -> tuple[list[str], bool]:
    raw = os.getenv("CORS_ALLOW_ORIGINS", "").strip()
    if not raw:
        origins = [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]
        return origins, True

    origins = [o.strip() for o in raw.split(",") if o.strip()]
    if any(o == "*" for o in origins):
        return ["*"], False

    return origins, True


cors_origins, cors_allow_credentials = _parse_cors_origins()
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=cors_allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()


@app.post("/chats")
def create_chat(data: CreateChatRequest):
    return create_chat_workflow(
        data.platform,
        data.title,
        data.subtitle,
        data.theme
    )


@app.post("/chats/{chat_id}/messages")
def add_message(chat_id: int, msg: AddMessageRequest):
    return add_message_workflow(
        chat_id,
        msg.sender_id,
        msg.type,
        msg.content,
        msg.timestamp,
        msg.direction,
        msg.reply_to,
        msg.meta
    )


@app.patch("/chats/{chat_id}")
def update_chat(chat_id: int, data: CreateChatRequest):
    return update_chat_workflow(
        chat_id,
        data.platform,
        data.title,
        data.subtitle,
        data.theme
    )


@app.get("/chats/{chat_id}")
def get_chat(chat_id: int):
    path = generate_preview(chat_id)
    return FileResponse(Path(path), media_type="image/png")


@app.get("/chats/{chat_id}/preview")
def preview(chat_id: int):
    path = generate_preview(chat_id)
    return FileResponse(Path(path), media_type="image/png")


@app.post("/participants/{participant_id}/avatar")
def upload_avatar(participant_id: int, file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Avatar must be an image")

    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    path = (UPLOADS_DIR / f"{participant_id}.png").resolve()

    with open(path, "wb") as f:
        f.write(file.file.read())

    update_avatar(participant_id, str(path))

    return {"avatar": str(path)}