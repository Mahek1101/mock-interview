from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float
from datetime import datetime
from app.database import Base

class Session(Base):
    __tablename__ = "sessions"

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic        = Column(String, nullable=False)  # e.g. "frontend", "backend", "behavioral"
    total_score  = Column(Float, default=0)
    total_questions = Column(Integer, default=0)
    status       = Column(String, default="in_progress")  # in_progress, completed
    created_at   = Column(DateTime, default=datetime.utcnow)

class Question(Base):
    __tablename__ = "questions"

    id         = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    question   = Column(Text, nullable=False)
    answer     = Column(Text, default="")
    feedback   = Column(Text, default="")
    score      = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
