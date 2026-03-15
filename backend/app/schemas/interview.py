from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SessionCreate(BaseModel):
    topic: str

class AnswerSubmit(BaseModel):
    session_id: int
    question_id: int
    answer: str

class QuestionOut(BaseModel):
    id: int
    question: str
    answer: str
    feedback: str
    score: float
    created_at: datetime

    class Config:
        from_attributes = True

class SessionOut(BaseModel):
    id: int
    topic: str
    total_score: float
    total_questions: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
