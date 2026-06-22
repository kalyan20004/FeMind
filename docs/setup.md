# FeMind Setup Guide

## Requirements
- Python 3.10+
- Node.js 18+
- SQLite3

## 1. Backend Setup
1. Open a terminal in the `backend` directory.
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

## 2. Sensor Simulator
To generate live streaming telemetry, run the simulator in a separate terminal:
```bash
cd backend
source .venv/bin/activate
python simulator.py
```
This will continuously push realistic telemetry (and calculated degradation) to the SQLite database.

## 3. Frontend Setup
1. Open a terminal in the `frontend` directory.
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the web interface at `http://localhost:5173`.

## 4. Initial Access
- **Employee ID**: `admin`
- **Access Token**: `tata123`
