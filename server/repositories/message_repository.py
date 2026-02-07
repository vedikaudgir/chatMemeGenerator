import sqlite3
import json

DB = "mockchat.db"

def get_conn():
    return sqlite3.connect(DB)

def add_message(
    chat_id,
    sender_id,
    msg_type,
    content,
    timestamp,
    direction,
    reply_to=None,
    meta=None
):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO messages(
            chat_id, sender_id, type, content,
            timestamp, direction, reply_to, meta
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        chat_id,
        sender_id,
        msg_type,
        content,
        timestamp,
        direction,
        reply_to,
        json.dumps(meta) if meta else None
    ))

    conn.commit()
    conn.close()

def get_messages(chat_id):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
        SELECT * FROM messages
        WHERE chat_id=?
        ORDER BY id ASC
    """, (chat_id,))

    rows = cur.fetchall()
    conn.close()
    return rows
