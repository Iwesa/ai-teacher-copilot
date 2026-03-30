from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from pydantic import BaseModel, Field
from agents.state import CopilotState

class StrategyReviewResult(BaseModel):
    is_approved: bool = Field(description="True if strategies are CBC-aligned, False otherwise.")
    feedback: str = Field(description="If False, explain what needs fixing.")

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0, timeout=120, max_retries=2)
structured_llm = llm.with_structured_output(StrategyReviewResult)

async def review_strategy(state: CopilotState) -> dict:
    if state.get("revision_count", 0) >= 3:
        return {"is_approved": True, "final_content": state["current_draft"]}

    prompt = f"""
    Evaluate these teaching strategies for {state['topic']} (Grade {state['grade']}).
    Rules:
    1. Activities MUST be learner-centered (learners doing, not just teacher talking).
    2. Real-life connections must be authentically Kenyan.
    3. If a challenge was provided ("{state.get('challenge')}"), the strategies MUST address it.
    
    Draft: {state['current_draft']}
    """
    
    result = await structured_llm.ainvoke([SystemMessage(content="You are a strict instructional reviewer."), HumanMessage(content=prompt)])
    
    if result.is_approved:
        return {"is_approved": True, "final_content": state["current_draft"]}
    return {"is_approved": False, "review_feedback": [result.feedback]}