from server.repositories.chat_repository import create_chat, get_chat
from server.repositories.participant_repository import (
    add_participant,
    get_participants
)
from server.repositories.message_repository import (
    add_message,
    get_messages
)

from server.renderers.whatsapp import render_whatsapp

def create_chat_workflow(platform, title, subtitle, theme):
    chat_id = create_chat(platform, title, subtitle, theme)

    me_id = add_participant(chat_id, "Me", "me")
    other_id = add_participant(chat_id, title, "other")

    chat = get_chat(chat_id)
    participants = get_participants(chat_id)
    messages = []

    preview_path = render_whatsapp(chat, participants, messages)

    return {
        "chat_id": chat_id,
        "preview": preview_path,
        "me_id": me_id,
        "other_id": other_id
    }

def add_message_workflow(
    chat_id,
    sender_id,
    msg_type,
    content,
    timestamp,
    direction,
    reply_to=None,
    meta=None
):
    add_message(
        chat_id,
        sender_id,
        msg_type,
        content,
        timestamp,
        direction,
        reply_to,
        meta
    )

    return {"status": "message added"}

def get_chat_state(chat_id):
    chat = get_chat(chat_id)
    participants = get_participants(chat_id)
    messages = get_messages(chat_id)

    return {
        "chat": chat,
        "participants": participants,
        "messages": messages
    }

def generate_preview(chat_id):
    chat = get_chat(chat_id)
    participants = get_participants(chat_id)
    messages = get_messages(chat_id)

    platform = chat[1]

    if platform == "whatsapp":
        path = render_whatsapp(chat, participants, messages)
    else:
        raise ValueError("Unsupported platform")

    return path
