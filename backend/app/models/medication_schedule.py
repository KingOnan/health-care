from datetime import time

from sqlalchemy import ForeignKey, Time
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


# 약 스케줄
class MedicationSchedule(Base):
    __tablename__ = "medication_schedules"

    medication_schedule_seq: Mapped[int] = mapped_column(
        primary_key=True, autoincrement=True, comment="약 스케줄 기본키"
    )
    medication_item_seq: Mapped[int] = mapped_column(
        ForeignKey("medication_items.medication_item_seq"), comment="약 기본키(외래키)"
    )
    scheduled_time: Mapped[time] = mapped_column(Time, comment="복용 시간")
