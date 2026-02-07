import sqlite3

DB = "mockchat.db"


def get_conn():
    return sqlite3.connect(DB)


def add_participant(chat_id, name, role):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO participants(chat_id, name, role)
        VALUES (?, ?, ?)
    """, (chat_id, name, role))

    conn.commit()
    pid = cur.lastrowid
    conn.close()
    return pid


def get_participants(chat_id):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
        SELECT * FROM participants WHERE chat_id=?
    """, (chat_id,))

    rows = cur.fetchall()
    conn.close()
    return rows

def update_avatar(participant_id, path):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
        UPDATE participants
        SET avatar_path=?
        WHERE id=?
    """, (path, participant_id))

    conn.commit()
    conn.close()
