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

async def draft_content(state: CopilotState, config: RunnableConfig) -> dict:
    
    search_query = f"{state['grade']} {state['area']} {state['topic']}"
    syllabus_context = get_syllabus_context(search_query, "Lesson Plan")

    # ─── REFINEMENT MODE ───
    if state.get("refinement_prompt") and state.get("current_draft"):
        system_msg = "You are a Kenya CBC curriculum editor."
        prompt = f"""
        Modify this existing lesson plan based EXACTLY on the user's request.
        
        USER REQUEST: {state['refinement_prompt']}
        
        CURRENT DRAFT:
        {state['current_draft']}
        
        RULES:
        1. Only change what was requested. Keep the rest intact.
        2. Keep the standard CBC Markdown headers (##).
        """
    
    # ─── CREATION MODE ───
    else:
        system_msg = "You are a Kenya CBC curriculum specialist. Write a practical lesson plan."
        prompt = f"""
        Write a CBC lesson plan with exactly these sections:
        ## LESSON DETAILS
        ## SPECIFIC LEARNING OUTCOMES
        ## KEY INQUIRY QUESTIONS
        ## CORE COMPETENCES & VALUES
        ## LEARNING EXPERIENCES (Introduction, Lesson Development, Conclusion)
        ## LEARNING RESOURCES
        ## ASSESSMENT RUBRIC

        INPUTS:
        Level: {state['level']} | Grade: {state['grade']} | Area: {state['area']}
        Topic: {state['topic']} | Duration: {state.get('duration', '40')} mins
        Context: {state.get('context', 'None')}
        
        ---
        OFFICIAL KICD SYLLABUS CONTEXT:
        You MUST align your lesson plan with the following official curriculum guidelines retrieved for this topic:
        {syllabus_context}
        ---
        """
        
    # Inject reviewer feedback if looping
    if state.get("revision_count", 0) > 0 and state.get("review_feedback"):
        prompt += f"\n\nCRITICAL REVISION INSTRUCTIONS:\nFix these issues:\n{state['review_feedback'][-1]}"

    messages = [SystemMessage(content=system_msg), HumanMessage(content=prompt)]
    response = await llm.ainvoke(messages, config)
    
    return {"current_draft": response.content, "revision_count": state.get("revision_count", 0) + 1}