from pydantic import BaseModel

class CopilotResponse(BaseModel):
    content: str
    revision_count: int
    is_approved: bool