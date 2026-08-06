from datetime import datetime, time

from pydantic import BaseModel

from app.models.enums import CheckStatus, EatTiming, SupplementEatStatus


# 영양제 항목 등록 요청
class SupplementItemCreate(BaseModel):
    name: str
    timing: EatTiming
    status: SupplementEatStatus
    product_name: str | None = None
    company_name: str | None = None
    nutrition_info: str | None = None
    description: str | None = None
    scheduled_times: list[time]


# 수정 요청에서 스케줄 하나를 표현. supplement_schedule_seq가 있으면 기존 스케줄의 시각 변경,
# 없으면(None) 새로 추가하는 시각으로 처리
class SupplementScheduleUpdate(BaseModel):
    supplement_schedule_seq: int | None = None
    scheduled_time: time


# 영양제 항목 수정 요청. 스케줄은 시각 값만 받는 등록과 달리, 기존 스케줄과 매칭하기 위해
# supplement_schedule_seq를 함께 받음
class SupplementItemUpdate(BaseModel):
    name: str
    timing: EatTiming
    status: SupplementEatStatus
    product_name: str | None = None
    company_name: str | None = None
    nutrition_info: str | None = None
    description: str | None = None
    schedules: list[SupplementScheduleUpdate]


# 상세 응답에서 스케줄 하나를 표현. 수정 요청 시 그대로 되돌려 보낼 수 있도록 ID를 포함
class SupplementScheduleResponse(BaseModel):
    supplement_schedule_seq: int
    scheduled_time: time


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
    status: SupplementEatStatus
    schedules: list[SupplementScheduleResponse]
    created_at: datetime


# 영양제 항목 목록 조회 응답 (목록 화면에 필요한 필드만)
class SupplementItemListResponse(BaseModel):
    supplement_item_seq: int
    name: str
    status: SupplementEatStatus
    scheduled_times: list[time]


# 영양제 복용 상태 변경 요청
class SupplementStatusUpdate(BaseModel):
    status: SupplementEatStatus


# 영양제 오늘 복용 항목 목록 조회 응답
class SupplementTodayItemResponse(BaseModel):
    supplement_item_seq: int
    supplement_schedule_seq: int
    name: str
    scheduled_time: time
    time_group: str  # 아침/점심/저녁/밤
    status: CheckStatus  # 미확인/복용완료/건너뛰기
    is_next: bool
    is_missed: bool  # 이미 지난 시간대인데 아직 미확인인 경우
