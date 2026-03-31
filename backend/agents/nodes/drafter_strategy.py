from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.runnables import RunnableConfig
from agents.state import CopilotState
from utils.rag import get_syllabus_context

# Initialize the LLM Drafter
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash", 
    temperature=0.2,
    timeout=120,
    max_retries=2
)

async def draft_strategy(state: CopilotState, config: RunnableConfig) -> dict:
    
    # --- RETRIEVE KICD CONTEXT ---
    search_query = f"{state['grade']} {state['area']} {state['topic']}"
    syllabus_context = get_syllabus_context(search_query, "Lesson Plan")

    # ─── REFINEMENT MODE ───
    if state.get("refinement_prompt") and state.get("current_draft"):
        system_msg = "You are a Kenya CBC curriculum editor."
        prompt = f"""
        Modify this existing teaching strategy based EXACTLY on the user's request.
        
        USER REQUEST: {state['refinement_prompt']}
        
        CURRENT DRAFT:
        {state['current_draft']}
        
        RULES:
        1. Only change what was requested. Keep the rest intact.
        2. Keep the standard CBC Markdown headers (##).
        """
    
    # ─── CREATION MODE ───
    else:
        system_msg = "You are a Kenya CBC pedagogical expert."
        prompt = f"""
        Write a comprehensive Teaching Strategy with exactly these sections:
        ## OVERVIEW & RATIONALE
        ## ACTIVE LEARNING STRATEGY
        ## DIFFERENTIATION (Gifted, Average, Struggling Learners)
        ## RESOURCE INTEGRATION
        ## REFLECTION & FORMATIVE ASSESSMENT

        INPUTS:
        Level: {state['level']} | Grade: {state['grade']} | Area: {state['area']}
        Topic: {state['topic']} 
        Specific Challenge (if any): {state.get('challenge', 'None')}
        
        ---
        OFFICIAL KICD SYLLABUS CONTEXT:
        You MUST align your teaching strategies with the following official curriculum guidelines retrieved for this topic:
        {syllabus_context}
        ---
        """
        
    # Inject reviewer feedback if looping
    if state.get("revision_count", 0) > 0 and state.get("review_feedback"):
        prompt += f"\n\nCRITICAL REVISION INSTRUCTIONS:\nFix these issues:\n{state['review_feedback'][-1]}"

    messages = [SystemMessage(content=system_msg), HumanMessage(content=prompt)]
    response = await llm.ainvoke(messages, config)
    
    return {"current_draft": response.content, "revision_count": state.get("revision_count", 0) + 1}