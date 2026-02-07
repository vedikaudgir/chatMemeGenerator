from pydantic import BaseModel
from typing import Optional, Dict

class AddMessageRequest(BaseModel):
    sender_id: int
    type: str
    content: str
    timestamp: str
    direction: str
    reply_to: Optional[int] = None
    meta: Optional[Dict] = None
