from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import json

from agents.diagnosis import DiagnosisAgent
from agents.cascade import CascadeAgent
from agents.cost_engine import CostEngine
from agents.planner import PlannerAgent
from agents.photo_diagnosis import PhotoDiagnosisAgent
from rag.retriever import KnowledgeRetriever
from models.anomaly_detector import AnomalyDetector
from models.rul_predictor import RULPredictor
from db.database import init_db, get_db
from db.models import Feedback
from utils.report_generator import generate_report
from data.simulator import get_current_readings, ASSETS

app = FastAPI(title="FeMind API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components at startup
anomaly_detector = AnomalyDetector()
rul_predictor = RULPredictor()
knowledge_retriever = KnowledgeRetriever()
diagnosis_agent = DiagnosisAgent(knowledge_retriever)
cascade_agent = CascadeAgent()
cost_engine = CostEngine()
planner_agent = PlannerAgent(knowledge_retriever)
photo_agent = PhotoDiagnosisAgent()

@app.on_event("startup")
async def startup():
    init_db()
    anomaly_detector.load_or_train()
    rul_predictor.load_or_train()
    knowledge_retriever.initialize()

# ─── Request/Response Models ───────────────────────────────────────────────

class SensorInput(BaseModel):
    asset_id: str
    vibration: float
    temperature: float
    pressure: float
    current: float
    rpm: float

class KnowledgeQuery(BaseModel):
    query: str
    asset_id: Optional[str] = None
    conversation_history: Optional[List[dict]] = []

class MaintenancePlanRequest(BaseModel):
    asset_id: str
    fault_type: str
    severity: str
    rul_days: int
    conversation_history: Optional[List[dict]] = []

class CostRequest(BaseModel):
    asset_id: str
    failure_probability: float
    rul_days: int

class FeedbackRequest(BaseModel):
    session_id: str
    asset_id: str
    predicted_fault: str
    actual_fault: str
    diagnosis_correct: bool
    engineer_notes: Optional[str] = ""

class ReportRequest(BaseModel):
    asset_id: str
    fault_type: Optional[str] = "Bearing Wear / Vibration Anomaly"
    root_cause: Optional[str] = "Fatigue induced by continuous high-stress operation"
    risk_level: Optional[str] = "CRITICAL"
    rul_days: Optional[int] = 18
    maintenance_plan: Optional[str] = "1. Initiate LOTO procedures\n2. Inspect drive-end bearing\n3. Replace SKF bearing if radial clearance exceeds threshold"
    cost_analysis: Optional[dict] = {
        "option_a": {"total_cost": "₹1.6Cr"},
        "option_b": {"expected_cost": "₹4.5Cr"},
        "decision_summary": {"acting_now_saves": "₹2.9Cr"}
    }

# ─── Endpoints ─────────────────────────────────────────────────────────────

@app.get("/assets/health")
async def get_all_asset_health():
    """Returns live health readings for all 5 assets."""
    return {"assets": list(get_current_readings().values())}

@app.post("/analyze/sensor")
async def analyze_sensor(data: SensorInput):
    """
    Input: live sensor readings for one asset
    Output: anomaly flag, health score, anomaly details
    """
    is_anomaly, score, details = anomaly_detector.analyze(
        asset_id=data.asset_id,
        readings={
            "vibration": data.vibration,
            "temperature": data.temperature,
            "pressure": data.pressure,
            "current": data.current,
            "rpm": data.rpm,
        }
    )
    rul = rul_predictor.predict(data.asset_id, {
        "vibration": data.vibration,
        "temperature": data.temperature,
        "current": data.current,
    }) if is_anomaly else None

    return {
        "asset_id": data.asset_id,
        "is_anomaly": is_anomaly,
        "health_score": score,
        "anomaly_details": details,
        "rul_days": rul,
        "status": "CRITICAL" if score < 50 else "WARNING" if score < 75 else "HEALTHY",
    }

@app.post("/analyze/cascade")
async def analyze_cascade(data: SensorInput):
    """
    DIFFERENTIATOR: Returns full failure cascade chain.
    Input: asset with anomaly
    Output: ordered list of equipment that will fail + production impact
    """
    return cascade_agent.get_cascade(data.asset_id)

@app.post("/analyze/cost")
async def analyze_cost(data: CostRequest):
    """
    DIFFERENTIATOR: Quantifies "stop now vs risk it" in rupees.
    """
    analysis = cost_engine.calculate(
        asset_id=data.asset_id,
        failure_probability=data.failure_probability,
        rul_days=data.rul_days,
    )
    return analysis

@app.post("/diagnose/photo")
async def diagnose_photo(
    file: UploadFile = File(...),
    asset_id: str = "UNKNOWN",
    asset_type: str = "industrial_equipment"
):
    """
    DIFFERENTIATOR: Upload a photo, get instant fault diagnosis.
    """
    image_bytes = await file.read()
    result = await photo_agent.diagnose(image_bytes, asset_id, asset_type)
    return result

@app.post("/query/knowledge")
async def query_knowledge(data: KnowledgeQuery):
    """RAG-powered knowledge query over manuals, SOPs, historical records."""
    response = await diagnosis_agent.query(
        question=data.query,
        asset_id=data.asset_id,
        conversation_history=data.conversation_history,
    )
    return response

@app.post("/plan/maintenance")
async def get_maintenance_plan(data: MaintenancePlanRequest):
    """Generate step-by-step maintenance plan."""
    plan = await planner_agent.generate(
        asset_id=data.asset_id,
        fault_type=data.fault_type,
        severity=data.severity,
        rul_days=data.rul_days,
        conversation_history=data.conversation_history,
    )
    return plan

@app.post("/report/generate")
async def create_report(data: ReportRequest):
    """Generate downloadable PDF maintenance report."""
    pdf_path = generate_report(data.dict())
    from fastapi.responses import FileResponse
    return FileResponse(pdf_path, media_type="application/pdf", filename="maintenance_report.pdf")

@app.post("/feedback/submit")
async def submit_feedback(data: FeedbackRequest):
    """
    TRIBAL KNOWLEDGE: Store engineer feedback to improve future diagnoses.
    """
    db = next(get_db())
    feedback = Feedback(
        session_id=data.session_id,
        asset_id=data.asset_id,
        predicted_fault=data.predicted_fault,
        actual_fault=data.actual_fault,
        diagnosis_correct=data.diagnosis_correct,
        engineer_notes=data.engineer_notes,
    )
    db.add(feedback)
    db.commit()
    return {"status": "saved", "message": "Feedback recorded. FeMind learns from your expertise."}

@app.get("/alerts/active")
async def get_active_alerts():
    """Returns any active alerts based on current sensor readings."""
    readings = get_current_readings()
    alerts = []
    for asset_id, reading in readings.items():
        if reading["health_score"] < 50:
            alerts.append({
                "asset_id": asset_id,
                "severity": "CRITICAL",
                "message": f"{asset_id} health score at {reading['health_score']}%. Immediate attention required.",
                "timestamp": "2026-06-05T03:14:22",
            })
        elif reading["health_score"] < 75:
            alerts.append({
                "asset_id": asset_id,
                "severity": "WARNING",
                "message": f"{asset_id} showing early degradation signs.",
                "timestamp": "2026-06-05T03:14:22",
            })
    return {"alerts": alerts}
