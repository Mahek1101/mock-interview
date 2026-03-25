from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserOut, Token
from app.utils.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", status_code=201)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=hash_password(payload.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "username": user.username, "email": user.email}

@router.post("/login")
# Change: Ensure OAuth2PasswordRequestForm is imported at the top
from fastapi.security import OAuth2PasswordRequestForm

@router.post("/login")
def login(user_credentials: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # 1. Normalize the input: strip spaces and convert to lowercase
    input_email = user_credentials.username.strip().lower()

    # 2. Search using the cleaned email
    user = db.query(User).filter(User.email == input_email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Invalid Credentials"
        )

    # 3. Verify password against the hashed_password in DB
    if not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Invalid Credentials"
        )

    access_token = create_access_token(data={"user_id": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "username": current_user.username, "email": current_user.email}

@router.get("/admin/users")
def get_all_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Optional: Add a check to ensure current_user.is_admin is True 
    users = db.query(User).all()
    return {"total_users": len(users), "users": users}
