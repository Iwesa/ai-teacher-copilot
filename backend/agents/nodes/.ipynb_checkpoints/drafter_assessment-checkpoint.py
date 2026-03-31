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

async def draft_assessment(state: CopilotState, config: RunnableConfig) -> dict:
    
    # --- RETRIEVE KICD CONTEXT ---
    search_query = f"{state['grade']} {state['area']} {state['topic']}"
    syllabus_context = get_syllabus_context(search_query, "Lesson Plan")
    
    # ─── REFINEMENT MODE ───
    if state.get("refinement_prompt") and state.get("current_draft"):
        system_msg = "You are a Kenya CBC curriculum editor."
        prompt = f"""
        Modify this existing assessment based EXACTLY on the user's request.
        
        USER REQUEST: {state['refinement_prompt']}
        
        CURRENT DRAFT:
        {state['current_draft']}
        
        RULES:
        1. Only change what was requested.
        2. Keep standard CBC Markdown headers.
        """
        
    # ─── CREATION MODE ───
    else:
        system_msg = "You are a Kenya CBC assessment design expert."
        prompt = f"""
        Write a {state['assessment_type']} tool with exactly these sections:
        
        ## ASSESSMENT DETAILS
        ## LEARNING OUTCOMES BEING ASSESSED
        ## ASSESSMENT TASKS
        
        ## MARKING RUBRIC
        CRITICAL: Do NOT use a table. Use a structured list format. 
        For each criterion, list the 4 CBC levels with a brief description:
        * **Criterion Name**
          * Exceeds Expectation: ...
          * Meets Expectation: ...
          * Approaches Expectation: ...
          * Below Expectation: ...
        
        ## OBSERVATION CHECKLIST
        Use a simple bulleted list of 5 observable behaviors. Do NOT use a table.
        
        ## RECORD KEEPING TEMPLATE
        Provide a very simple 3-column table: | Learner Name | Score/Level | Follow-up Needed |

        INPUTS:
        Level: {state['level']} | Grade: {state['grade']} | Area: {state['area']}
        Topic: {state['topic']} | Type: {state['assessment_type']}
        Outcomes to assess: {state.get('outcomes', 'Derive from KICD syllabus')}
        
        ---
        OFFICIAL KICD SYLLABUS CONTEXT:
        You MUST align your assessment tool with the following official curriculum guidelines retrieved for this topic:
        {syllabus_context}
        ---
        """
        
    # Inject reviewer feedback if looping
    if state.get("revision_count", 0) > 0 and state.get("review_feedback"):
        prompt += f"\n\nCRITICAL REVISION INSTRUCTIONS:\nFix these issues:\n{state['review_feedback'][-1]}"

    messages = [SystemMessage(content=system_msg), HumanMessage(content=prompt)]
    response = await llm.ainvoke(messages, config)
    
    return {"current_draft": response.content, "revision_count": state.get("revision_count", 0) + 1}