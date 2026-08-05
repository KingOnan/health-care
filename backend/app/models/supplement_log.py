from datetime import date, datetime, time

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Time, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.enums import CheckStatus


# 영양제 복용 기록 (날짜별)
class SupplementLog(Base):
    __tablename__ = "supplement_logs"

    supplement_log_seq: Mapped[int] = mapped_column(
        primary_key=True, autoincrement=True, comment="영양제 복용 기록 기본키"
    )
    supplement_schedule_seq: Mapped[int] = mapped_column(
        ForeignKey("supplement_schedules.supplement_schedule_seq", ondelete="CASCADE"),
        comment="영양제 예정 시각 기본키(외래키). 스케줄이 삭제되면 딸린 복용 기록도 함께 삭제됨",
    )
    log_date: Mapped[date] = mapped_column(Date, comment="복용 기록 날짜")
    status: Mapped[CheckStatus] = mapped_column(Enum(CheckStatus), comment="복용 여부")
    actual_time: Mapped[time | None] = mapped_column(Time, comment="실제 복용 시각")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), comment="만들어진 날짜")
