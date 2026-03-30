from typing import TypedDict, Annotated, List, Optional
import operator

class CopilotState(TypedDict):
    # Shared Inputs
    level: str; grade: str; area: str; topic: str
    
    # Tool-Specific Inputs
    duration: Optional[str]
    context: Optional[str]
    challenge: Optional[str]
    assessment_type: Optional[str]
    outcomes: Optional[str]
    current_draft: Optional[str]
    refinement_prompt: Optional[str]
    
    # Internal workflow
    review_feedback: Annotated[List[str], operator.add] 
    revision_count: int
    is_approved: bool
    final_content: str