from datetime import datetime, time
from typing import Self

from pydantic import BaseModel, Field, model_validator

from app.models.enums import CheckStatus, EatTiming, MedicationEatStatus


# 약 항목 등록 요청
class MedicationItemCreate(BaseModel):
    name: str
    timing: EatTiming
    status: MedicationEatStatus
    is_prescription: bool = False
    product_name: str | None = None
    company_name: str | None = None
    nutrition_info: str | None = None
    description: str | None = None
    scheduled_times: list[time] = Field(min_length=1)

    # 처방약은 봉지 하나에 여러 성분이 섞여 나와서 "제품 하나"로 특정되지 않아, 제품명·회사명·함량을 두지 않음.
    # 화면에서도 입력란이 숨겨지지만, 구분 토글을 껐다 켜는 사이 남아있던 값이 실려 올 수 있어 서버에서 확실히 비움
    @model_validator(mode="after")
    def clear_product_fields_if_prescription(self) -> Self:
        if self.is_prescription:
            self.product_name = None
            self.company_name = None
            self.nutrition_info = None

        return self


# 수정 요청에서 스케줄 하나를 표현. medication_schedule_seq가 있으면 기존 스케줄의 시각 변경,
# 없으면(None) 새로 추가하는 시각으로 처리
class MedicationScheduleUpdate(BaseModel):
    medication_schedule_seq: int | None = None
    scheduled_time: time


# 약 항목 수정 요청. 스케줄은 시각 값만 받는 등록과 달리, 기존 스케줄과 매칭하기 위해
# medication_schedule_seq를 함께 받음
class MedicationItemUpdate(BaseModel):
    name: str
    timing: EatTiming
    status: MedicationEatStatus
    is_prescription: bool = False
    product_name: str | None = None
    company_name: str | None = None
    nutrition_info: str | None = None
    description: str | None = None
    schedules: list[MedicationScheduleUpdate] = Field(min_length=1)

    # 등록 요청과 같은 이유로, 처방약이면 제품명·회사명·함량을 서버에서 비움
    @model_validator(mode="after")
    def clear_product_fields_if_prescription(self) -> Self:
        if self.is_prescription:
            self.product_name = None
            self.company_name = None
            self.nutrition_info = None

        return self


# 상세 응답에서 스케줄 하나를 표현. 수정 요청 시 그대로 되돌려 보낼 수 있도록 ID를 포함
class MedicationScheduleResponse(BaseModel):
    medication_schedule_seq: int
    scheduled_time: time


# 약 항목 응답
class MedicationItemResponse(BaseModel):
    medication_item_seq: int
    name: str
    product_name: str | None
    company_name: str | None
    nutrition_info: str | None
    description: str | None
    photo_path: str | None
    timing: EatTiming
    status: MedicationEatStatus
    is_prescription: bool
    schedules: list[MedicationScheduleResponse]
    created_at: datetime


# 약 항목 목록 조회 응답 (목록 화면에 필요한 필드만)
class MedicationItemListResponse(BaseModel):
    medication_item_seq: int
    name: str
    status: MedicationEatStatus
    scheduled_times: list[time]


# 약 복용 상태 변경 요청
class MedicationStatusUpdate(BaseModel):
    status: MedicationEatStatus


# 약 복용 체크
class MedicationCheckRequest(BaseModel):
    status: CheckStatus


# 약 오늘 복용 항목 목록 조회 응답
class MedicationTodayItemResponse(BaseModel):
    medication_item_seq: int
    medication_schedule_seq: int
    medication_log_seq: int | None  # None이면 아직 미확인(로그 없음). 체크 취소 시 이 값으로 삭제
    name: str
    scheduled_time: time
    time_group: str  # 아침/점심/저녁/밤
    status: CheckStatus | None  # None이면 아직 미확인
    is_next: bool
    is_missed: bool  # 이미 지난 시간대인데 아직 미확인인 경우
