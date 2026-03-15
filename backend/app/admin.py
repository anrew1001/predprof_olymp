from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.auth import UserOut, hash_password, require_admin
from app.database import get_db
from app.models import User

router = APIRouter(prefix="/admin", tags=["admin"])


# ── Pydantic schemas ───────────────────────────────────────────────────────────
class CreateUserRequest(BaseModel):
    first_name: str
    last_name: str
    login: str
    password: str
    role: str = "user"


# ── Endpoints ──────────────────────────────────────────────────────────────────
@router.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: CreateUserRequest,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> UserOut:
    """Create a new user. Admin only."""
    # Validate role value
    if payload.role not in ("admin", "user"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="role must be 'admin' or 'user'",
        )

    existing = db.query(User).filter(User.login == payload.login).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with login '{payload.login}' already exists",
        )

    new_user = User(
        first_name=payload.first_name,
        last_name=payload.last_name,
        login=payload.login,
        password_hash=hash_password(payload.password),
        role=payload.role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
