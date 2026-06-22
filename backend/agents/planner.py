from langchain_google_genai import ChatGoogleGenerativeAI
from rag.retriever import KnowledgeRetriever
from config import GEMINI_API_KEY

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=GEMINI_API_KEY)

PLANNER_PROMPT = """You are FeMind, an expert maintenance planner for Tata Steel.
Generate a structured, step-by-step maintenance action plan for {asset_id}.

Fault: {fault_type}
Severity: {severity}
RUL (Days until failure): {rul_days}

Context from SOPs and Manuals:
{context}

Create a maintenance plan following this exact structure:
1. PRE-REQUISITES (Safety, LOTO, Personnel)
2. ISOLATION & SHUTDOWN PROCEDURE
3. REPAIR/REPLACEMENT STEPS
4. COMMISSIONING & TESTING
5. REQUIRED SPARES & TOOLS

Be direct, technical, and prioritize safety. Use the provided context to list specific parts, torque values, and safety procedures."""

class PlannerAgent:
    def __init__(self, retriever: KnowledgeRetriever):
        self.retriever = retriever

    async def generate(self, asset_id: str, fault_type: str, severity: str, rul_days: int, conversation_history: list = []) -> str:
        """
        Generate a detailed maintenance plan based on RAG SOPs.
        """
        query = f"SOP standard operating procedure maintenance replacement {fault_type} {asset_id}"
        context_chunks = self.retriever.retrieve(query, asset_id=asset_id)
        context = "\n\n---\n\n".join(context_chunks)

        prompt = PLANNER_PROMPT.format(
            asset_id=asset_id,
            fault_type=fault_type,
            severity=severity,
            rul_days=rul_days,
            context=context,
        )

        response = await llm.ainvoke([
            ("system", "You are an expert industrial maintenance planner. Be precise and technical."),
            ("human", prompt)
        ])

        return {
            "maintenance_plan": response.content,
            "sources_consulted": len(context_chunks)
        }
