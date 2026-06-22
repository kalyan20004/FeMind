import base64
from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from config import GEMINI_API_KEY

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=GEMINI_API_KEY)

PHOTO_DIAGNOSIS_PROMPT = """You are an expert industrial maintenance engineer with 30 years of experience 
diagnosing equipment faults in steel manufacturing plants.

Examine this photo and provide:

1. VISUAL OBSERVATIONS: What you can see in the image
2. FAULT DIAGNOSIS: Most likely fault type (be specific — e.g., "Stage 3 bearing wear with inner race pitting")
3. SEVERITY: Critical / High / Medium / Low
4. CONFIDENCE: Your confidence in this diagnosis (%)
5. SUPPORTING EVIDENCE: Specific visual cues that support your diagnosis
6. IMMEDIATE ACTION: What should happen in the next 1-4 hours
7. SAFETY CONCERN: Any immediate safety risks visible

Context about this equipment: {context}

Be direct and technical. This engineer is trained and needs actionable information fast."""

class PhotoDiagnosisAgent:
    async def diagnose(self, image_bytes: bytes, asset_id: str, asset_type: str) -> dict:
        """
        Diagnose fault from an uploaded photo using Gemini 1.5 Pro.
        """
        image_b64 = base64.b64encode(image_bytes).decode("utf-8")
        context = f"Asset: {asset_id}, Type: {asset_type}, Location: Blast Furnace Area, Tata Steel Plant"
        prompt = PHOTO_DIAGNOSIS_PROMPT.format(context=context)

        message = HumanMessage(
            content=[
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}}
            ]
        )

        try:
            response = await llm.ainvoke([message])
            diagnosis_text = response.content

            return {
                "asset_id": asset_id,
                "diagnosis": diagnosis_text,
                "model_used": "gemini-1.5-pro",
                "image_analyzed": True,
                "note": "Photo diagnosis uses Gemini 1.5 Pro Vision. Always verify with physical inspection before maintenance.",
            }

        except Exception as e:
            return {
                "asset_id": asset_id,
                "diagnosis": f"Photo analysis failed: {str(e)}. Please ensure valid image format.",
                "image_analyzed": False,
                "error": str(e),
            }
