import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from pydantic import BaseModel, Field
from agents.state import CopilotState
from dotenv import load_dotenv

load_dotenv()

class ReviewResult(BaseModel):
    is_approved: bool = Field(description="True if the lesson plan perfectly aligns with CBC standards, False otherwise.")
    feedback: str = Field(description="If not approved, specific instructions on what needs to be changed. If approved, return 'Looks good'.")

# Set temperature to 0 for strict, deterministic evaluation
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0, timeout=120, max_retries=2)
structured_llm = llm.with_structured_output(ReviewResult)

async def review_content(state: CopilotState) -> dict:
    # Circuit breaker: Prevent infinite loops. If it fails 3 times, pass it through anyway.
    if state.get("revision_count", 0) >= 3:
        return {"is_approved": True, "final_content": state["current_draft"]}

    system_msg = "You are a strict Kenya KICD quality assurance officer evaluating a CBC lesson plan."
    
    prompt = f"""
    Evaluate this lesson plan draft for Grade {state['grade']}, Area: {state['area']}.
    
    Rules for approval:
    1. It MUST NOT contain summative grading (e.g., marks out of 10) in the assessment section.
    2. Resources must be realistic and locally available in Kenya.
    3. It must explicitly list CBC Core Competencies.
    
    Draft to review:
    {state['current_draft']}
    """
    
    messages = [
        SystemMessage(content=system_msg), 
        HumanMessage(content=prompt)
    ]
    
    result = await structured_llm.ainvoke(messages)
    
    if result.is_approved:
        return {
            "is_approved": True,
            "final_content": state["current_draft"]
        }
    else:
        return {
            "is_approved": False,
            "review_feedback": [result.feedback]
        }