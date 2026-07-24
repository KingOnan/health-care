from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


# user_id(로그인 아이디)로 유저 한 명 조회, 없으면 None
def get_user_by_user_id(db: Session, user_id: str) -> User | None:
    # fmt: off
    return db.scalar(
        select(
            User
        )
        .where(
            User.user_id == user_id
        )
    )


# user_seq로 유저 한 명 조회, 없으면 None
def get_user_by_user_seq(db: Session, user_seq: int) -> User | None:
    # fmt: off
    return db.scalar(
        select(
            User
        )
        .where(
            User.user_seq == user_seq
        )
    )
