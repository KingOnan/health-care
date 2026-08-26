import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config.settings import settings
from app.routers import blood_pressure, medication, supplement, user
from app.schemas.common import ApiResponse

logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allowed_origins.split(","),
    allow_credentials=True,  # 쿠키 기반 인증을 쓸 경우를 대비, JWT를 방식이라 없어도 동작은 하지만 관례상 같이 켜둠
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router)
app.include_router(supplement.router)
app.include_router(medication.router)
app.include_router(blood_pressure.router)


# 라우터에서 명시적으로 던진 HTTPException(404/422 등)을 공통 응답 봉투 형태로 변환
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=ApiResponse[None](success=False, message=jsonable_encoder(exc.detail)).model_dump(),
        headers=exc.headers,
    )


# 경로/쿼리/바디 파라미터 자체의 타입 검증 실패
# (FastAPI가 라우터 진입 전에 자동으로 던짐, HTTPException이 아니라 별도 타입이라 위 핸들러로 안 잡힘)
@app.exception_handler(RequestValidationError)
async def request_validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content=ApiResponse[None](success=False, message=jsonable_encoder(exc.errors())).model_dump(),
    )


# 미처리 예외에 대한 안전망 — 실제 예외는 서버 로그에 남기고, 클라이언트에는 스택트레이스 없이 통일된 500 응답만 반환
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception while handling request: %s", request.url)
    return JSONResponse(
        status_code=500,
        content=ApiResponse[None](success=False, message="서버 오류가 발생했습니다.").model_dump(),
    )
