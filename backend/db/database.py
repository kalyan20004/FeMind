from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config import DATABASE_URL

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    from db.models import Base
    Base.metadata.create_all(bind=engine)
    print("Database initialized")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
