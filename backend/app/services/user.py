from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.user import get_user_by_user_id
from app.security import create_access_token, verify_password


# 아이디+비밀번호 검증 후 JWT 발급, 실패 시 401 예외 발생
async def login(db: AsyncSession, user_id: str, user_password: str) -> str:
    user = await get_user_by_user_id(db, user_id)

    if user is None or not verify_password(user_password, user.user_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="아이디 또는 비밀번호가 올바르지 않습니다",
        )

    return create_access_token({"sub": str(user.user_seq)})
