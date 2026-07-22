from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.enums import CheckTiming


# 혈당 기록
class BloodSugarRecord(Base):
    __tablename__ = "blood_sugar_records"

    blood_sugar_record_seq: Mapped[int] = mapped_column(
        primary_key=True, autoincrement=True, comment="혈당 기록 기본키"
    )
    user_seq: Mapped[int] = mapped_column(ForeignKey("users.user_seq"), comment="유저 기본키(외래키)")
    # 측정한 날짜+시간을 하나로 합쳐서 저장
    measured_at: Mapped[datetime] = mapped_column(DateTime, comment="측정 일시")
    # 공복/식후 2시간 (기준값이 서로 달라 판정 시 구분해서 계산해야 함)
    check_timing: Mapped[CheckTiming] = mapped_column(Enum(CheckTiming), comment="측정 시기")
    glucose_value: Mapped[int] = mapped_column(Integer, comment="혈당 수치")
    memo: Mapped[str | None] = mapped_column(String(500), comment="비고")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), comment="만들어진 날짜")
