from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
import app.models
from app.routers.auth import router as auth_router
from app.routers.interview import router as interview_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Mock Interview API", version="0.3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(interview_router)

@app.get("/")
def root():
    return {"message": "AI Mock Interview API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}
