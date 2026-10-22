from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, Field

from app.models.enums import BloodSugarLevel, CheckTiming

# 입력 허용 범위 — 가정용 혈당측정기의 측정 범위(20~600, 그 밖은 기기가 Lo/Hi로만 표시)를
# 벗어나는 값은 입력 실수로 보고 거름
GlucoseValue = Annotated[int, Field(ge=20, le=600)]  # 혈당 수치 (mg/dL)
Memo = Annotated[str | None, Field(max_length=100)]


class BloodSugarCreate(BaseModel):
    measured_at: datetime
    check_timing: CheckTiming  # 측정 시기 (공복 / 식후 2시간)
    glucose_value: GlucoseValue
    memo: Memo = None


class BloodSugarUpdate(BaseModel):
    measured_at: datetime
    check_timing: CheckTiming  # 측정 시기 (공복 / 식후 2시간)
    glucose_value: GlucoseValue
    memo: Memo = None


class BloodSugarResponse(BaseModel):
    blood_sugar_seq: int
    measured_at: datetime
    check_timing: CheckTiming  # 측정 시기 (공복 / 식후 2시간)
    glucose_value: int  # 혈당 수치 (mg/dL)
    memo: str | None
    level: BloodSugarLevel
    created_at: datetime
