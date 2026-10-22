from datetime import datetime
from typing import Annotated, Self

from pydantic import BaseModel, Field, model_validator

from app.models.enums import BloodPressureLevel

# 입력 허용 범위 — 가정용 혈압계가 화면에 표시할 수 있는 값은 막지 않고, 그 밖의 값(0, 음수 등 입력 실수)만 거름
Systolic = Annotated[int, Field(ge=50, le=299)]  # 수축기 혈압 (mmHg)
Diastolic = Annotated[int, Field(ge=30, le=250)]  # 이완기 혈압 (mmHg)
Pulse = Annotated[int, Field(ge=30, le=200)]  # 맥박수 (회/분)
Memo = Annotated[str | None, Field(max_length=100)]


class BloodPressureCreate(BaseModel):
    measured_at: datetime
    systolic: Systolic
    diastolic: Diastolic
    pulse: Pulse
    memo: Memo = None

    # 이완기는 항상 수축기보다 낮음 — 두 칸을 바꿔 적는 실수(예: 80/130)를 막음
    @model_validator(mode="after")
    def check_diastolic_lower(self) -> Self:
        if self.diastolic >= self.systolic:
            raise ValueError("이완기 혈압은 수축기 혈압보다 낮아야 합니다.")
        return self


class BloodPressureUpdate(BaseModel):
    measured_at: datetime
    systolic: Systolic
    diastolic: Diastolic
    pulse: Pulse
    memo: Memo = None

    # 이완기는 항상 수축기보다 낮음 — 두 칸을 바꿔 적는 실수(예: 80/130)를 막음
    @model_validator(mode="after")
    def check_diastolic_lower(self) -> Self:
        if self.diastolic >= self.systolic:
            raise ValueError("이완기 혈압은 수축기 혈압보다 낮아야 합니다.")
        return self


class BloodPressureResponse(BaseModel):
    blood_pressure_seq: int
    measured_at: datetime
    systolic: int  # 수축기 혈압
    diastolic: int  # 이완기 혈압
    pulse: int  # 맥박수
    memo: str | None
    level: BloodPressureLevel
    created_at: datetime
