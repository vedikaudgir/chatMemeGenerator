import sqlite3

DB = "mockchat.db"


def get_conn():
    return sqlite3.connect(DB)


def create_chat(platform, title, subtitle, theme):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO chats(platform, title, subtitle, theme)
        VALUES (?, ?, ?, ?)
    """, (platform, title, subtitle, theme))

    conn.commit()
    chat_id = cur.lastrowid
    conn.close()
    return chat_id


def get_chat(chat_id):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("SELECT * FROM chats WHERE id=?", (chat_id,))
    row = cur.fetchone()

    conn.close()
    return row