from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.auth import LoginRequest, TokenResponse
from app.services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["인증"])


# 로그인: 아이디+비밀번호 검증 후 JWT 발급
@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    access_token = auth_service.login(db, request.user_id, request.user_password)
    return TokenResponse(access_token=access_token)
