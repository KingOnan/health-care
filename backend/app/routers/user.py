from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.user import LoginRequest, TokenResponse, UserResponse
from app.security import get_current_user
from app.services import user as user_service

router = APIRouter(prefix="/user", tags=["회원"])


# 로그인: 아이디+비밀번호 검증 후 JWT 발급
@router.post("/login", response_model=ApiResponse[TokenResponse])
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)) -> ApiResponse[TokenResponse]:
    access_token = await user_service.login(db, request.user_id, request.user_password)
    return ApiResponse(data=TokenResponse(access_token=access_token))


# 로그인한 내 정보 조회 (토큰 검증 테스트용)
@router.get("/me", response_model=ApiResponse[UserResponse])
async def get_me(current_user: User = Depends(get_current_user)) -> ApiResponse[UserResponse]:
    return ApiResponse(data=UserResponse.model_validate(current_user, from_attributes=True))
