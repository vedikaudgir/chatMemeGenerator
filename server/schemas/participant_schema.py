from pydantic import BaseModel

class AddParticipantRequest(BaseModel):
    name: str
    role: str
