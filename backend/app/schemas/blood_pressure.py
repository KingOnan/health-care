from datetime import datetime

from pydantic import BaseModel

from app.models.enums import BloodPressureLevel


class BloodPressureCreate(BaseModel):
    measured_at: datetime
    systolic: int  # 수축기 혈압
    diastolic: int  # 이완기 혈압
    pulse: int  # 맥박수
    memo: str | None = None


class BloodPressureUpdate(BaseModel):
    measured_at: datetime
    systolic: int  # 수축기 혈압
    diastolic: int  # 이완기 혈압
    pulse: int  # 맥박수
    memo: str | None = None


class BloodPressureResponse(BaseModel):
    blood_pressure_seq: int
    measured_at: datetime
    systolic: int  # 수축기 혈압
    diastolic: int  # 이완기 혈압
    pulse: int  # 맥박수
    memo: str | None
    level: BloodPressureLevel
    created_at: datetime
