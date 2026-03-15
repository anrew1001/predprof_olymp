from sqlalchemy import Column, Integer, String, Enum
from app.database import Base
import enum


class UserRole(str, enum.Enum):
    admin = "admin"
    user = "user"


class User(Base):
    __tablename__ = "users"

    id: int = Column(Integer, primary_key=True, index=True, autoincrement=True)
    first_name: str = Column(String(100), nullable=False)
    last_name: str = Column(String(100), nullable=False)
    login: str = Column(String(100), unique=True, nullable=False, index=True)
    password_hash: str = Column(String(200), nullable=False)
    role: str = Column(Enum(UserRole), nullable=False, default=UserRole.user)
