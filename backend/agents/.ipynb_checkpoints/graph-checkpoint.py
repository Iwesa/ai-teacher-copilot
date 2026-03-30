from langgraph.graph import StateGraph, END
from agents.state import CopilotState

# Import Lesson Nodes
from agents.nodes.drafter import draft_content as draft_lesson
from agents.nodes.reviewer import review_content as review_lesson

# Import Strategy Nodes
from agents.nodes.drafter_strategy import draft_strategy
from agents.nodes.reviewer_strategy import review_strategy

# Import Assessment Nodes
from agents.nodes.drafter_assessment import draft_assessment
from agents.nodes.reviewer_assessment import review_assessment

def router_logic(state: CopilotState) -> str:
    return END if state.get("is_approved") else "draft_node"

def build_graph(draft_func, review_func):
    """Helper function to compile our standard 2-node self-correcting graph"""
    workflow = StateGraph(CopilotState)
    workflow.add_node("draft_node", draft_func)
    workflow.add_node("review_node", review_func)
    
    workflow.set_entry_point("draft_node")
    workflow.add_edge("draft_node", "review_node")
    workflow.add_conditional_edges("review_node", router_logic, {END: END, "draft_node": "draft_node"})
    
    return workflow.compile()

# Export our three specialized AI agents
lesson_graph = build_graph(draft_lesson, review_lesson)
strategy_graph = build_graph(draft_strategy, review_strategy)
assessment_graph = build_graph(draft_assessment, review_assessment)