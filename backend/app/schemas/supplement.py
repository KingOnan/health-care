from datetime import datetime, time

from pydantic import BaseModel

from app.models.enums import EatStatus, EatTiming


# 영양제 항목 등록 요청
class SupplementItemCreate(BaseModel):
    name: str
    timing: EatTiming
    product_name: str | None = None
    company_name: str | None = None
    nutrition_info: str | None = None
    description: str | None = None
    scheduled_times: list[time]


# 영양제 항목 수정 요청 (등록과 동일하게 전체 항목을 다시 받음)
class SupplementItemUpdate(SupplementItemCreate):
    pass


# 영양제 항목 응답
class SupplementItemResponse(BaseModel):
    supplement_item_seq: int
    name: str
    product_name: str | None
    company_name: str | None
    nutrition_info: str | None
    description: str | None
    photo_path: str | None
    timing: EatTiming
    status: EatStatus
    scheduled_times: list[time]
    created_at: datetime


# 영양제 항목 목록 조회 응답 (목록 화면에 필요한 필드만)
class SupplementItemListResponse(BaseModel):
    supplement_item_seq: int
    name: str
    status: EatStatus
    scheduled_times: list[time]
