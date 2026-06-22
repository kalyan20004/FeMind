# FeMind Sample API Inputs & Outputs

This document demonstrates the expected inputs and outputs for the core Machine Learning endpoints.

---

## 1. Anomaly Detection (Isolation Forest)
**Endpoint**: `POST /analyze/sensor`

**Input** (Live telemetry from SCADA):
```json
{
  "asset_id": "BF_FAN_12",
  "vibration": 14.5,
  "temperature": 85.2,
  "pressure": 110.1,
  "rpm": 1480,
  "current": 45.3
}
```

**Output**:
```json
{
  "asset_id": "BF_FAN_12",
  "anomaly_detected": true,
  "confidence": 0.94,
  "health_score": 62,
  "timestamp": "2026-06-06T15:30:00Z",
  "warning_message": "CRITICAL: High vibration detected in centrifugal fan bearings."
}
```

---

## 2. RAG Copilot (LangChain + ChromaDB)
**Endpoint**: `POST /query/knowledge`

**Input**:
```json
{
  "asset_id": "MOTOR_BF_01",
  "query": "What is the acceptable tolerance limit for stator winding temperature before an emergency shutdown is required?",
  "conversation_history": []
}
```

**Output**:
```json
{
  "answer": "According to the Tata Steel Standard Operating Procedure (SOP-MTR-004), the absolute maximum tolerance for stator winding temperature on the BF 01 Motor is 135°C (Class F insulation). If the temperature exceeds 130°C for more than 5 minutes, an immediate controlled shutdown must be initiated.",
  "sources": [
    "SOP-MTR-004.pdf",
    "Motor_Maintenance_Manual_v2.pdf"
  ],
  "confidence": 0.98
}
```

---

## 3. Decision Cost Engine
**Endpoint**: `POST /analyze/cost`

**Input**:
```json
{
  "asset_id": "BF_FAN_12",
  "estimated_rul_hours": 12,
  "probability_of_failure": 0.85
}
```

**Output**:
```json
{
  "recommendation": "STOP",
  "expected_cost_run_to_failure": 4500000.0,
  "expected_cost_planned_stop": 850000.0,
  "net_savings_inr": 3650000.0,
  "reasoning": "The 85% probability of a catastrophic failure within 12 hours outweighs the cost of a planned 4-hour maintenance stoppage."
}
```
