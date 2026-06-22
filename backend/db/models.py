from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, Text
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class Feedback(Base):
    """
    Tribal knowledge store.
    Every confirmed/corrected diagnosis becomes training data.
    """
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(100))
    asset_id = Column(String(50))
    predicted_fault = Column(String(200))
    actual_fault = Column(String(200))
    diagnosis_correct = Column(Boolean)
    engineer_notes = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

class MaintenanceLog(Base):
    """Auto-generated digital logbook entries."""
    __tablename__ = "maintenance_log"

    id = Column(Integer, primary_key=True, autoincrement=True)
    asset_id = Column(String(50))
    fault_type = Column(String(200))
    action_taken = Column(Text)
    engineer_id = Column(String(50))
    timestamp = Column(DateTime, default=datetime.utcnow)
    downtime_hours = Column(Float)
    cost_rs = Column(Float)

class SensorAlert(Base):
    """Persisted alert records."""
    __tablename__ = "sensor_alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    asset_id = Column(String(50))
    alert_type = Column(String(50))
    health_score = Column(Float)
    severity = Column(String(20))
    acknowledged = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
