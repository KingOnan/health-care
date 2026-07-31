from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User

# fmt: off

# user_id(로그인 아이디)로 유저 한 명 조회, 없으면 None
async def get_user_by_user_id(db: AsyncSession, user_id: str) -> User | None:
    return await db.scalar(
        select(
            User
        )
        .where(
            User.user_id == user_id
        )
    )


# user_seq로 유저 한 명 조회, 없으면 None
async def get_user_by_user_seq(db: AsyncSession, user_seq: int) -> User | None:
    return await db.scalar(
        select(
            User
        )
        .where(
            User.user_seq == user_seq
        )
    )
