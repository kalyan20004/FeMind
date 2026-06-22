# FeMind — System Architecture Document

## 1. System Overview
FeMind is a multi-agent autonomous maintenance intelligence system for steel 
manufacturing environments. It combines predictive ML models, LLM-powered reasoning, 
RAG knowledge retrieval, and causal failure cascade modeling to deliver decision-grade 
maintenance intelligence.

## 2. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Backend API | FastAPI (Python) | REST API serving all agent endpoints |
| Agent Orchestration | LangGraph | Multi-agent coordination and routing |
| LLM — Reasoning | Claude claude-sonnet-4-20250514 (Anthropic) | Diagnosis, planning, knowledge Q&A |
| LLM — Vision | GPT-4o (OpenAI) | Photo-based fault diagnosis |
| Vector Database | ChromaDB | RAG document storage and retrieval |
| Embeddings | OpenAI text-embedding-3-small | Document and query embedding |
| Anomaly Detection | Isolation Forest (scikit-learn) | Real-time sensor anomaly detection |
| RUL Prediction | XGBoost Regressor | Remaining useful life prediction |
| Cascade Modeling | NetworkX | Equipment dependency graph and failure propagation |
| Database | SQLite (PostgreSQL in production) | Feedback, alerts, maintenance logs |
| Frontend | React + Vite + Tailwind | User interface |
| Graph Visualization | React Flow | Cascade graph display |
| Report Generation | ReportLab | PDF maintenance reports |

## 3. Agent Architecture

### Supervisor Agent (LangGraph)
Routes incoming requests to the appropriate sub-agent based on intent classification.
Maintains conversation memory across multi-turn interactions.

### Diagnosis Agent
Uses Claude claude-sonnet-4-20250514 with RAG context from ChromaDB.
Provides fault diagnosis with confidence scores and evidence chains.

### Cascade Graph Engine (Differentiator)
Models equipment dependency relationships as a directed graph (NetworkX).
Computes failure propagation probabilities and cumulative production impact.

### Decision Cost Engine (Differentiator)
Calculates expected cost of each maintenance decision using:
  - Planned maintenance cost (labor + parts + downtime)
  - Expected catastrophic failure cost (repair + extended downtime × failure probability)
  - Savings from proactive action

### Photo Diagnosis Agent (Differentiator)
Accepts engineer-uploaded equipment photos via multipart form upload.
Uses GPT-4o Vision with maintenance-expert system prompt.
Returns structured diagnosis within 10 seconds.

### Maintenance Planner Agent
Generates SOP-aligned step-by-step maintenance plans.
Retrieves relevant manual sections and parts lists via RAG.

## 4. Data Flow

1. Sensor data arrives (simulated: 5 assets, 5 parameters each)
2. Isolation Forest detects anomalies → computes health score (0-100)
3. XGBoost predicts RUL in days
4. Cascade Graph Engine computes downstream risk chain
5. Decision Cost Engine quantifies financial impact of each option
6. Diagnosis Agent retrieves relevant knowledge + generates LLM diagnosis
7. Planner Agent generates maintenance plan with SOP references
8. Output delivered to engineer via Dashboard or Copilot chat interface
9. Engineer feedback stored in PostgreSQL → tribal knowledge accumulation

## 5. Anomaly Detection Logic
- Algorithm: Isolation Forest (100 trees, 5% contamination)
- Training: First 60 days of sensor data (normal operation baseline)
- Features: vibration, temperature, pressure, current, RPM
- Health score: normalized from isolation forest decision function (0–100 scale)
- Anomaly threshold: health score < 75 = WARNING, < 50 = CRITICAL

## 6. RUL Prediction Model
- Algorithm: XGBoost Regressor (100 estimators)
- Target: days remaining until failure
- Training features: vibration trend, temperature trend, current trend
- Trained on: simulated 90-day BF Fan 12 degradation dataset (bearing wear scenario)

## 7. RAG Pipeline
- Documents: Equipment manuals, SOPs, historical incident reports
- Chunking: RecursiveCharacterTextSplitter (500 chars, 50 overlap)
- Embedding: OpenAI text-embedding-3-small
- Retrieval: Top-4 most similar chunks by cosine similarity
- Generation: Claude claude-sonnet-4-20250514 with maintenance-expert system prompt

## 8. Assumptions and Limitations
- Sensor data is simulated for hackathon demonstration. Real deployment requires IoT integration.
- Failure cascade graph is manually defined based on steel plant domain knowledge.
  Production system would derive edges from FMEA and CMMS data.
- RUL model trained on single failure scenario (bearing wear). Production system
  would be trained on multi-year historical CMMS data.
- Photo diagnosis is general-purpose computer vision. Fine-tuned model on
  steel plant imagery would improve accuracy significantly.
- Cost figures (production value per hour, repair costs) are estimates.
  Real deployment integrates with SAP for accurate financial modeling.

## 9. Feedback and Learning Loop
Every engineer diagnosis confirmation or correction is stored in the feedback table
with: asset ID, predicted fault, actual fault, correctness flag, and engineer notes.
This dataset forms the basis for:
- Retrieval-augmented generation improvement (high-confidence feedback added to ChromaDB)
- Future fine-tuning of domain-specific SLM
- Trending of diagnosis accuracy over time
