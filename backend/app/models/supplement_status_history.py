from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.enums import SupplementEatStatus


# 영양제 복용 상태 이력 (복용률 계산시 중지 기간을 빼기 위해 사용)
class SupplementStatusHistory(Base):
    __tablename__ = "supplement_status_histories"

    supplement_status_history_seq: Mapped[int] = mapped_column(
        primary_key=True, autoincrement=True, comment="영양제 복용 상태 이력 기본키"
    )
    supplement_item_seq: Mapped[int] = mapped_column(
        ForeignKey("supplement_items.supplement_item_seq", ondelete="CASCADE"),
        comment="영양제 기본키(외래키). 영양제가 삭제되면 이력도 함께 삭제됨",
    )
    status: Mapped[SupplementEatStatus] = mapped_column(Enum(SupplementEatStatus), comment="바뀐 복용 상태")
    changed_at: Mapped[datetime] = mapped_column(DateTime, comment="상태가 바뀐 시각(KST)")
