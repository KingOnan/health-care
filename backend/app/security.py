from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config.settings import settings
from app.database import get_db
from app.models.user import User
from app.repositories.user import get_user_by_user_seq

# 비밀번호 해싱/검증에 사용할 알고리즘(bcrypt) 설정
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 요청에 Authorization: Bearer {토큰} 헤더가 있는지 확인하고 토큰을 뽑아내는 도구
bearer_scheme = HTTPBearer()


# 평문 비밀번호를 bcrypt로 해싱
def hash_password(plain_password: str) -> str:
    return pwd_context.hash(plain_password)


# 입력한 평문 비밀번호가 해싱된 값과 일치하는지 검증
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# 유저 식별 정보(data)를 담아 만료 시각이 포함된 JWT 발급
def create_access_token(data: dict[str, str]) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_access_token_expire_minutes)
    payload = {**data, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


# 토큰을 검증하고 안에 담긴 payload(유저 식별 정보 등)를 반환
def decode_access_token(token: str) -> dict[str, str]:
    return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])


# Authorization 헤더의 Bearer 토큰을 검증하고, 토큰 주인 User를 반환
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = decode_access_token(credentials.credentials)
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않은 토큰입니다",
        )

    user = get_user_by_user_seq(db, int(payload["sub"]))

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="사용자를 찾을 수 없습니다",
        )

    return user
