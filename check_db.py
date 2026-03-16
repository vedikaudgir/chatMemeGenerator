import sqlite3

DB = "mockchat.db"

def check_db():
    try:
        conn = sqlite3.connect(DB)
        cur = conn.cursor()
        
        print("--- CHATS ---")
        cur.execute("SELECT * FROM chats")
        for row in cur.fetchall():
            print(row)
            
        print("\n--- PARTICIPANTS ---")
        cur.execute("SELECT * FROM participants")
        for row in cur.fetchall():
            print(row)
            
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_db()
