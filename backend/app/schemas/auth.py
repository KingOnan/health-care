from pydantic import BaseModel


# 로그인 요청 (아이디 + 비밀번호)
class LoginRequest(BaseModel):
    user_id: str
    user_password: str


# 로그인 응답 (발급된 토큰)
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
