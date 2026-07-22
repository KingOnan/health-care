from datetime import time

from sqlalchemy import ForeignKey, Time
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


# 영양제 스케줄
class SupplementSchedule(Base):
    __tablename__ = "supplement_schedules"

    supplement_schedule_seq: Mapped[int] = mapped_column(
        primary_key=True, autoincrement=True, comment="영양제 스케줄 기본키"
    )
    supplement_item_seq: Mapped[int] = mapped_column(
        ForeignKey("supplement_items.supplement_item_seq"),
        comment="영양제 기본키(외래키)",
    )
    scheduled_time: Mapped[time] = mapped_column(Time, comment="복용 시간")
