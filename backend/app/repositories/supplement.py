from datetime import time

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import EatStatus
from app.models.supplement_item import SupplementItem
from app.models.supplement_schedule import SupplementSchedule
from app.schemas.supplement import SupplementItemCreate


# 영양제 등록
async def create_supplement_item(
    db: AsyncSession,
    user_seq: int,
    data: SupplementItemCreate,
    photo_path: str | None,
) -> int:
    item = SupplementItem(
        user_seq=user_seq,
        name=data.name,
        product_name=data.product_name,
        company_name=data.company_name,
        nutrition_info=data.nutrition_info,
        description=data.description,
        photo_path=photo_path,
        timing=data.timing,
        status=EatStatus.ING,
    )

    db.add(item)
    await db.flush()  # commit은 스케줄까지 함께 저장한 뒤 서비스 계층에서 한 번에 처리
    return item.supplement_item_seq


# 영양제 스케줄 등록
async def create_supplement_schedule(
    db: AsyncSession,
    supplement_item_seq: int,
    scheduled_times: list[time],
) -> None:
    for scheduled_time in scheduled_times:
        schedule = SupplementSchedule(
            supplement_item_seq=supplement_item_seq,
            scheduled_time=scheduled_time,
        )
        db.add(schedule)

    await db.flush()
