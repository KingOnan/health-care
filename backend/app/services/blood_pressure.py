from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories import blood_pressure as blood_pressure_repo
from app.schemas.blood_pressure import BloodPressureCreate


# 혈압 기록 등록
async def create_blood_pressure(
    db: AsyncSession,
    user_seq: int,
    data: BloodPressureCreate,
) -> int:
    blood_pressure_seq = await blood_pressure_repo.create_blood_pressure(db, user_seq, data)
    await db.commit()
    return blood_pressure_seq
