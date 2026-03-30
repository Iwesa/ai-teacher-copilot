from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from pydantic import BaseModel, Field
from agents.state import CopilotState

class AssessmentReviewResult(BaseModel):
    is_approved: bool = Field(description="True if the assessment perfectly aligns with CBC rubric standards.")
    feedback: str = Field(description="Specific instructions on what needs fixing.")

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0, timeout=120, max_retries=2)
structured_llm = llm.with_structured_output(AssessmentReviewResult)

async def review_assessment(state: CopilotState) -> dict:
    if state.get("revision_count", 0) >= 3:
        return {"is_approved": True, "final_content": state["current_draft"]}

    prompt = f"""
    Evaluate this {state['assessment_type']} for {state['topic']}.
    CRITICAL RULES:
    1. The rubric MUST use EXACTLY these four columns: Exceeds Expectation, Meets Expectation, Approaches Expectation, Below Expectation.
    2. If it is a "Formative Assessment", there must be NO summative marks (no "out of 10").
    
    Draft: {state['current_draft']}
    """
    
    result = await structured_llm.ainvoke([SystemMessage(content="You are a strict KICD assessment evaluator."), HumanMessage(content=prompt)])
    
    if result.is_approved:
        return {"is_approved": True, "final_content": state["current_draft"]}
    return {"is_approved": False, "review_feedback": [result.feedback]}