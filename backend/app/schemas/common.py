from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


# 모든 API 응답을 감싸는 공통 봉투. 성공 시 data에 실제 값, 실패 시 message에 에러 내용
class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    data: T | None = None
    message: str | list | None = None
