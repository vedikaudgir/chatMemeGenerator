from pydantic import BaseModel
from typing import Optional

class CreateChatRequest(BaseModel):
    platform: str
    title: str             
    subtitle: str          
    theme: Optional[str] = "light"

class CreateChatResponse(BaseModel):
    chat_id: int
    preview_url: str