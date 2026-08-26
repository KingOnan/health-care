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
