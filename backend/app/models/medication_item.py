from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.enums import EatStatus, EatTiming


# 약
class MedicationItem(Base):
    __tablename__ = "medication_items"

    medication_item_seq: Mapped[int] = mapped_column(
        primary_key=True, autoincrement=True, comment="약 기본키"
    )
    name: Mapped[str] = mapped_column(String(50), comment="명칭(이름)")
    product_name: Mapped[str | None] = mapped_column(String(50), comment="제품명")
    company_name: Mapped[str | None] = mapped_column(String(50), comment="회사명")
    nutrition_info: Mapped[str | None] = mapped_column(
        String(500), comment="함량/영양정보"
    )
    description: Mapped[str | None] = mapped_column(String(500), comment="설명")
    photo_path: Mapped[str | None] = mapped_column(String(255), comment="사진 경로")
    timing: Mapped[EatTiming] = mapped_column(Enum(EatTiming), comment="복용 시기")
    status: Mapped[EatStatus] = mapped_column(Enum(EatStatus), comment="복용 상태")
    is_prescription: Mapped[bool] = mapped_column(
        Boolean, default=False, comment="처방약 여부(일반 약국약인지, 병원 처방약인지)"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), comment="만들어진 날짜"
    )
