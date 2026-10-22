from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.blood_sugar import BloodSugar
from app.models.enums import CheckTiming
from app.schemas.blood_sugar import BloodSugarCreate, BloodSugarUpdate


# 혈당 기록 등록
async def create_blood_sugar(
    db: AsyncSession,
    user_seq: int,
    data: BloodSugarCreate,
) -> int:
    blood_sugar = BloodSugar(
        user_seq=user_seq,
        measured_at=data.measured_at,
        check_timing=data.check_timing,
        glucose_value=data.glucose_value,
        memo=data.memo,
    )

    db.add(blood_sugar)
    await db.flush()

    return blood_sugar.blood_sugar_seq


# 혈당 월별 목록 조회 (check_timing이 있으면 해당 측정 시기만)
async def get_blood_sugar_list(
    db: AsyncSession,
    user_seq: int,
    year: int,
    month: int,
    check_timing: CheckTiming | None,
) -> list[BloodSugar]:
    start = datetime(year, month, 1)

    if month == 12:
        end = datetime(year + 1, 1, 1)
    else:
        end = datetime(year, month + 1, 1)

    stmt = (
        # fmt: off
        select(BloodSugar)
        .where(
            BloodSugar.user_seq == user_seq,
            BloodSugar.measured_at >= start,
            BloodSugar.measured_at < end,
        )
        .order_by(BloodSugar.measured_at.desc())
    )

    if check_timing is not None:
        stmt = stmt.where(BloodSugar.check_timing == check_timing)

    result = await db.scalars(stmt)

    return list(result.all())


# 혈당 단건 상세 조회
async def get_blood_sugar(
    db: AsyncSession,
    user_seq: int,
    blood_sugar_seq: int,
) -> BloodSugar | None:
    return await db.scalar(
        # fmt: off
        select(BloodSugar)
        .where(
            BloodSugar.blood_sugar_seq == blood_sugar_seq,
            BloodSugar.user_seq == user_seq,
        )
    )


# 혈당 단건 수정
async def update_blood_sugar(
    db: AsyncSession,
    user_seq: int,
    blood_sugar_seq: int,
    data: BloodSugarUpdate,
) -> bool:
    item = await db.scalar(
        # fmt: off
        select(BloodSugar)
        .where(
            BloodSugar.blood_sugar_seq == blood_sugar_seq,
            BloodSugar.user_seq == user_seq,
        )
    )

    if item is None:
        return False

    item.measured_at = data.measured_at
    item.check_timing = data.check_timing
    item.glucose_value = data.glucose_value
    item.memo = data.memo

    return True


# 혈당 단건 삭제
async def delete_blood_sugar(
    db: AsyncSession,
    user_seq: int,
    blood_sugar_seq: int,
) -> bool:
    item = await db.scalar(
        # fmt: off
        select(BloodSugar)
        .where(
            BloodSugar.blood_sugar_seq == blood_sugar_seq,
            BloodSugar.user_seq == user_seq,
        )
    )

    if item is None:
        return False

    await db.delete(item)

    return True
