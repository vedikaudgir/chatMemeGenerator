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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://chat-meme-generator.vercel.app"],  # 👈 IMPORTANT
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REPO_ROOT = Path(__file__).resolve().parent.parent
SERVER_DIR = REPO_ROOT / "server"
UPLOADS_DIR = SERVER_DIR / "static" / "uploads"


def _parse_cors_origins() -> tuple[list[str], bool]:
    raw = os.getenv("CORS_ALLOW_ORIGINS", "").strip()
    raw_credentials = os.getenv("CORS_ALLOW_CREDENTIALS", "").strip().lower()
    credentials_override = None
    if raw_credentials in {"true", "1", "yes", "y"}:
        credentials_override = True
    elif raw_credentials in {"false", "0", "no", "n"}:
        credentials_override = False

    if not raw:
        # Safe default for deployments: allow any origin but disable credentials.
        # If you need credentialed requests, set CORS_ALLOW_ORIGINS explicitly.
        allow_credentials = False if credentials_override is None else credentials_override
        return ["*"], allow_credentials

    origins = [o.strip() for o in raw.split(",") if o.strip()]
    if any(o == "*" for o in origins):
        allow_credentials = False if credentials_override is None else credentials_override
        # Credentials must be false when allow_origins is "*"
        return ["*"], False if allow_credentials else False

    allow_credentials = True if credentials_override is None else credentials_override
    return origins, allow_credentials


cors_origins, cors_allow_credentials = _parse_cors_origins()
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=cors_allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.options("/{path:path}")
def options_passthrough(path: str):
    # Some proxies/clients send OPTIONS without typical CORS preflight headers.
    # Returning 204 avoids noisy 400s while CORS middleware still sets headers
    # when it detects a real preflight request.
    return {}


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