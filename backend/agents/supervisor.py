from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated, List
import operator

class AgentState(TypedDict):
    messages: Annotated[List[dict], operator.add]
    asset_id: str
    intent: str
    sensor_data: dict
    anomaly_result: dict
    diagnosis: str
    cascade_chain: dict
    cost_analysis: dict
    maintenance_plan: str
    final_response: str

def classify_intent(state: AgentState) -> str:
    """Route to the correct agent based on the user's request."""
    last_message = state["messages"][-1]["content"].lower()

    if any(word in last_message for word in ["photo", "image", "picture", "camera"]):
        return "photo_diagnosis"
    elif any(word in last_message for word in ["plan", "procedure", "sop", "steps", "how to fix"]):
        return "planner"
    elif any(word in last_message for word in ["cascade", "what else", "impact", "affect"]):
        return "cascade"
    elif any(word in last_message for word in ["cost", "money", "rupees", "worth", "stop", "decision"]):
        return "cost"
    elif any(word in last_message for word in ["sensor", "vibration", "temperature", "reading", "data"]):
        return "sensor_analysis"
    else:
        return "diagnosis"

def build_supervisor_graph(
    diagnosis_agent,
    cascade_agent,
    cost_engine,
    planner_agent,
    photo_agent,
    anomaly_detector,
    rul_predictor,
):
    """
    Build the LangGraph multi-agent supervisor.
    In a hackathon context, you can simplify this to a routing function
    rather than full LangGraph if time is tight.
    """
    # Simple routing approach (faster to implement):
    # The supervisor just routes to the right agent and returns results.
    # This is sufficient to demonstrate multi-agent orchestration.

    async def route_and_execute(user_query: str, asset_id: str,
                                 conversation_history: list = [],
                                 context: dict = {}) -> dict:
        intent = classify_intent({"messages": [{"content": user_query}],
                                   "asset_id": asset_id, "intent": "",
                                   "sensor_data": {}, "anomaly_result": {},
                                   "diagnosis": "", "cascade_chain": {},
                                   "cost_analysis": {}, "maintenance_plan": "",
                                   "final_response": ""})

        result = {"intent": intent, "asset_id": asset_id}

        if intent == "diagnosis":
            result["response"] = await diagnosis_agent.query(
                user_query, asset_id, conversation_history
            )
        elif intent == "cascade":
            result["response"] = cascade_agent.get_cascade(asset_id)
        elif intent == "cost":
            fp = context.get("failure_probability", 0.47)
            rul = context.get("rul_days", 18)
            result["response"] = cost_engine.calculate(asset_id, fp, rul)
        elif intent == "planner":
            fault = context.get("fault_type", "Bearing Wear")
            result["response"] = await planner_agent.generate(
                asset_id, fault, "HIGH", context.get("rul_days", 18), conversation_history
            )
        else:
            result["response"] = await diagnosis_agent.query(
                user_query, asset_id, conversation_history
            )

        return result

    return route_and_execute
