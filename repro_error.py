import sys
import os

# Add the current directory to sys.path to import from server
sys.path.append(os.getcwd())

from server.services.chat_service import generate_preview

def test_preview():
    try:
        print("Testing generate_preview(2)...")
        path = generate_preview(2)
        print(f"Success! Preview saved to: {path}")
    except Exception as e:
        import traceback
        print("\n--- ERROR DETECTED ---")
        traceback.print_exc()

if __name__ == "__main__":
    test_preview()
