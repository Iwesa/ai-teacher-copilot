from pydantic import BaseModel, Field
from typing import Optional

class LessonPlanRequest(BaseModel):
    level: str = Field(..., description="The education level, e.g., Lower Primary")
    grade: str = Field(..., description="The specific grade, e.g., Grade 4")
    area: str = Field(..., description="The learning area, e.g., Mathematics")
    topic: str = Field(..., description="The specific strand or topic to be taught")
    duration: str = Field("40", description="Duration of the lesson in minutes")
    context: Optional[str] = Field(None, description="Optional classroom context (e.g., rural, large class)")