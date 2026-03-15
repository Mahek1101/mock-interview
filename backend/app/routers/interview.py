from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession
from app.database import get_db
from app.models.user import User
from app.models.interview import Session, Question
from app.schemas.interview import SessionCreate, AnswerSubmit
from app.utils.auth import get_current_user
from app.utils.openai_helper import generate_question, evaluate_answer

router = APIRouter(prefix="/interview", tags=["Interview"])

@router.post("/start")
def start_session(
    payload: dict,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    topic      = payload.get("topic")
    difficulty = payload.get("difficulty", "medium")

    valid_topics = ["frontend", "backend", "behavioral", "dsa"]
    if topic not in valid_topics:
        raise HTTPException(status_code=400, detail="Invalid topic")

    session = Session(
        user_id=current_user.id,
        topic=topic,
        status="in_progress"
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    question_text = generate_question(topic, difficulty)
    question = Question(session_id=session.id, question=question_text)
    db.add(question)
    db.commit()
    db.refresh(question)

    return {
        "session_id": session.id,
        "topic": session.topic,
        "difficulty": difficulty,
        "question_id": question.id,
        "question": question.question,
        "question_number": 1
    }

@router.post("/answer")
def submit_answer(
    payload: dict,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(Session).filter(
        Session.id == payload.get("session_id"),
        Session.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    question = db.query(Question).filter(
        Question.id == payload.get("question_id"),
        Question.session_id == session.id
    ).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    result = evaluate_answer(question.question, payload.get("answer", ""), session.topic)

    question.answer   = payload.get("answer", "")
    question.feedback = result.get("feedback", "")
    question.score    = result.get("score", 0)
    db.commit()

    all_questions = db.query(Question).filter(
        Question.session_id == session.id,
        Question.answer != ""
    ).all()
    session.total_questions = len(all_questions)
    session.total_score = sum(q.score for q in all_questions) / len(all_questions)
    db.commit()

    return {
        "score": result.get("score", 0),
        "feedback": result.get("feedback", ""),
        "strengths": result.get("strengths", []),
        "improvements": result.get("improvements", []),
        "resources": result.get("resources", []),
        "question_number": session.total_questions
    }

@router.post("/next")
def next_question(
    payload: dict,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(Session).filter(
        Session.id == payload.get("session_id"),
        Session.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    prev      = db.query(Question).filter(Question.session_id == session.id).all()
    prev_texts = [q.question for q in prev]
    difficulty = payload.get("difficulty", "medium")

    question_text = generate_question(session.topic, difficulty, prev_texts)
    question = Question(session_id=session.id, question=question_text)
    db.add(question)
    db.commit()
    db.refresh(question)

    return {
        "session_id": session.id,
        "question_id": question.id,
        "question": question.question,
        "question_number": len(prev) + 1
    }

@router.post("/complete/{session_id}")
def complete_session(
    session_id: int,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(Session).filter(
        Session.id == session_id,
        Session.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.status = "completed"
    db.commit()

    questions = db.query(Question).filter(
        Question.session_id == session_id,
        Question.answer != ""
    ).all()

    return {
        "session_id": session.id,
        "topic": session.topic,
        "total_score": round(session.total_score, 1),
        "total_questions": session.total_questions,
        "questions": [{
            "question": q.question,
            "answer": q.answer,
            "feedback": q.feedback,
            "score": q.score
        } for q in questions]
    }

@router.get("/history")
def get_history(
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sessions = db.query(Session).filter(
        Session.user_id == current_user.id,
        Session.status == "completed"
    ).order_by(Session.created_at.desc()).all()

    return [{
        "id": s.id,
        "topic": s.topic,
        "total_score": round(s.total_score, 1),
        "total_questions": s.total_questions,
        "created_at": s.created_at
    } for s in sessions]
