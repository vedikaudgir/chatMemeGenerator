from fastapi import FastAPI
from fastapi.responses import FileResponse

from server.schemas.chat_schema import CreateChatRequest
from server.schemas.message_schema import AddMessageRequest

from server.services.chat_service import (
    create_chat_workflow,
    add_message_workflow,
    get_chat_state,
    generate_preview
)

from server.repositories.__init__db import init_db

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Chat Meme Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
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
    from server.services.chat_service import update_chat_workflow
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
    return FileResponse(path, media_type="image/png")

@app.get("/chats/{chat_id}/preview")
def preview(chat_id: int):
    path = generate_preview(chat_id)
    return FileResponse(path, media_type="image/png")

from fastapi import UploadFile, File
from server.repositories.participant_repository import update_avatar

@app.post("/participants/{participant_id}/avatar")
def upload_avatar(participant_id: int, file: UploadFile = File(...)):
    path = f"server/static/uploads/{participant_id}.png"

    with open(path, "wb") as f:
        f.write(file.file.read())

    update_avatar(participant_id, path)

    return {"avatar": path}
