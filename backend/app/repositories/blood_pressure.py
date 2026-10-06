from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.blood_pressure import BloodPressure
from app.schemas.blood_pressure import BloodPressureCreate


# 혈압 기록 등록
async def create_blood_pressure(
    db: AsyncSession,
    user_seq: int,
    data: BloodPressureCreate,
) -> int:
    blood_pressure = BloodPressure(
        user_seq=user_seq,
        measured_at=data.measured_at,
        systolic=data.systolic,
        diastolic=data.diastolic,
        pulse=data.pulse,
        memo=data.memo,
    )

    db.add(blood_pressure)
    await db.flush()

    return blood_pressure.blood_pressure_seq


# 혈압 월별 목록 조회
async def get_blood_pressure_list(
    db: AsyncSession,
    user_seq: int,
    year: int,
    month: int,
) -> list[BloodPressure]:
    start = datetime(year, month, 1)

    if month == 12:
        end = datetime(year + 1, 1, 1)
    else:
        end = datetime(year, month + 1, 1)

    result = await db.scalars(
        # fmt: off
        select(BloodPressure)
        .where(
            BloodPressure.user_seq == user_seq,
            BloodPressure.measured_at >= start,
            BloodPressure.measured_at < end,
        )
    )

    return list(result.all())
