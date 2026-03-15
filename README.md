# AI Mock Interview App

Practice coding and behavioral interviews with an AI interviewer that generates questions, evaluates your answers, and gives detailed feedback.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, CSS |
| Backend | Python, FastAPI |
| AI | OpenAI GPT-4o |
| Database | SQLite (dev) → PostgreSQL (prod) |
| Auth | JWT |

## Project Structure

```
mock-interview/
├── frontend/         # React app
│   └── src/
│       ├── components/
│       │   ├── interview/   # Question, Answer, Feedback components
│       │   ├── results/     # Score, Report components
│       │   ├── auth/        # Login, Register
│       │   └── layout/      # Navbar
│       ├── pages/           # Route-level pages
│       ├── hooks/           # Custom React hooks
│       ├── api/             # API call functions
│       └── styles/          # Global CSS
└── backend/          # FastAPI app
    └── app/
        ├── routers/         # API routes
        ├── models/          # Database models
        ├── schemas/         # Pydantic schemas
        └── utils/           # Auth + OpenAI helpers
```

## Getting Started

### Backend
```bash
cd backend
/opt/homebrew/opt/python@3.11/bin/python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Roadmap

- [x] Step 1 — Project structure
- [ ] Step 2 — Auth (register, login, JWT)
- [ ] Step 3 — OpenAI integration
- [ ] Step 4 — Interview session UI
- [ ] Step 5 — Results page
- [ ] Step 6 — Session history
- [ ] Step 7 — Polish & deploy
