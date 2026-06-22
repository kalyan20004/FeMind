from langchain_google_genai import ChatGoogleGenerativeAI
from rag.retriever import KnowledgeRetriever
from config import GEMINI_API_KEY

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=GEMINI_API_KEY)

SYSTEM_PROMPT = """You are FeMind, an expert AI maintenance engineer for Tata Steel's blast furnace plant.
You have deep knowledge of centrifugal fans, cooling pumps, conveyors, induction motors, and blast furnace equipment.

When diagnosing faults:
1. Always cite the specific sensor readings that led to your diagnosis
2. Give a confidence percentage based on how well symptoms match known fault patterns
3. Reference relevant SOPs or manual sections when available
4. Provide both immediate actions and long-term recommendations
5. Be concise but thorough — engineers need actionable information fast

Format your diagnosis as:
- FAULT TYPE: (e.g., Bearing Wear — Stage 2)
- CONFIDENCE: (e.g., 87%)
- EVIDENCE: (bullet list of what triggered this diagnosis)
- ROOT CAUSE: (most probable cause)
- IMMEDIATE ACTION: (what to do right now)
- REFERENCES: (which manual/SOP sections apply)
"""

class DiagnosisAgent:
    def __init__(self, retriever: KnowledgeRetriever):
        self.retriever = retriever

    async def query(self, question: str, asset_id: str = None, conversation_history: list = []) -> dict:
        """
        Multi-turn conversational diagnosis with RAG-enhanced context.
        """
        context_chunks = self.retriever.retrieve(question, asset_id=asset_id)
        context = "\n\n---\n\n".join(context_chunks)

        messages = [("system", SYSTEM_PROMPT)]
        for msg in conversation_history[-6:]:
            role = "human" if msg["role"] == "user" else "ai"
            messages.append((role, msg["content"]))

        user_message = f"Asset: {asset_id or 'Unknown'}\n\nRelevant knowledge base context:\n{context}\n\nEngineer question: {question}"
        messages.append(("human", user_message))

        response = await llm.ainvoke(messages)
        answer = response.content

        return {
            "answer": answer,
            "sources_used": len(context_chunks),
            "asset_id": asset_id,
            "model": "gemini-1.5-pro",
        }

    async def diagnose_from_sensor(self, asset_id: str, sensor_readings: dict, anomaly_details: dict) -> dict:
        """
        Automated diagnosis from sensor anomaly — no human query needed.
        """
        readings_text = "\n".join([f"- {k}: {v}" for k, v in sensor_readings.items()])
        anomalies_text = "\n".join([
            f"- {k}: baseline={v['baseline']}, current={v['current']}, deviation={v['deviation_pct']}%"
            for k, v in anomaly_details.items()
        ])

        query = f"Diagnose the fault for {asset_id} based on these abnormal sensor readings:\n\nCurrent readings:\n{readings_text}\n\nParameters outside normal range:\n{anomalies_text}\n\nProvide a structured fault diagnosis."

        context_chunks = self.retriever.retrieve(f"{asset_id} fault diagnosis bearing vibration temperature", asset_id=asset_id)
        context = "\n\n---\n\n".join(context_chunks)

        response = await llm.ainvoke([
            ("system", SYSTEM_PROMPT),
            ("human", f"Knowledge base:\n{context}\n\n{query}")
        ])

        return {
            "diagnosis": response.content,
            "asset_id": asset_id,
            "triggered_by": "automated_sensor_analysis",
        }
