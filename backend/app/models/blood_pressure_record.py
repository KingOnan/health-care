from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


# 혈압 기록
class BloodPressureRecord(Base):
    __tablename__ = "blood_pressure_records"

    blood_pressure_record_seq: Mapped[int] = mapped_column(
        primary_key=True, autoincrement=True, comment="혈압 기록 기본키"
    )
    user_seq: Mapped[int] = mapped_column(ForeignKey("users.user_seq"), comment="유저 기본키(외래키)")
    # 측정한 날짜+시간을 하나로 합쳐서 저장
    measured_at: Mapped[datetime] = mapped_column(DateTime, comment="측정 일시")
    systolic: Mapped[int] = mapped_column(Integer, comment="수축기")
    diastolic: Mapped[int] = mapped_column(Integer, comment="이완기")
    pulse: Mapped[int] = mapped_column(Integer, comment="맥박수")
    memo: Mapped[str | None] = mapped_column(String(500), comment="비고")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), comment="만들어진 날짜")
