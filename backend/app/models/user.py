from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


# 유저
class User(Base):
    __tablename__ = "users"

    user_seq: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, comment="유저 기본키")
    user_id: Mapped[str] = mapped_column(String(50), unique=True, index=True, comment="유저 아이디")
    user_password: Mapped[str] = mapped_column(String(255), comment="유저 비밀번호")
    user_name: Mapped[str] = mapped_column(String(50), comment="유저 이름")
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False, comment="데모용인지 아닌지")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), comment="만들어진 날짜")
