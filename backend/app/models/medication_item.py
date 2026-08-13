from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.enums import EatTiming, MedicationEatStatus
from app.models.medication_schedule import MedicationSchedule


# 약
class MedicationItem(Base):
    __tablename__ = "medication_items"

    medication_item_seq: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, comment="약 기본키")
    user_seq: Mapped[int] = mapped_column(ForeignKey("users.user_seq"), comment="유저 기본키(외래키)")
    name: Mapped[str] = mapped_column(String(50), comment="명칭(이름)")
    product_name: Mapped[str | None] = mapped_column(String(50), comment="제품명")
    company_name: Mapped[str | None] = mapped_column(String(50), comment="회사명")
    nutrition_info: Mapped[str | None] = mapped_column(String(500), comment="함량/영양정보")
    description: Mapped[str | None] = mapped_column(String(500), comment="설명")
    photo_path: Mapped[str | None] = mapped_column(String(255), comment="사진 경로")
    timing: Mapped[EatTiming] = mapped_column(Enum(EatTiming), comment="복용 시기")
    status: Mapped[MedicationEatStatus] = mapped_column(Enum(MedicationEatStatus), comment="복용 상태")
    is_prescription: Mapped[bool] = mapped_column(
        Boolean, default=False, comment="처방약 여부(일반 약국약인지, 병원 처방약인지)"
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), comment="만들어진 날짜")

    # DB 컬럼 아님, 연관된 스케줄들을 파이썬 객체로 접근하기 위한 선언 (항상 복용 시각 오름차순으로 정렬)
    schedules: Mapped[list[MedicationSchedule]] = relationship(order_by=MedicationSchedule.scheduled_time)
