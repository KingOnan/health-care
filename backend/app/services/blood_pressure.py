from sqlalchemy.ext.asyncio import AsyncSession

from app.config.settings import settings
from app.models.enums import BloodPressureLevel
from app.repositories import blood_pressure as blood_pressure_repo
from app.schemas.blood_pressure import BloodPressureCreate, BloodPressureResponse


# 혈압 기록 등록
async def create_blood_pressure(
    db: AsyncSession,
    user_seq: int,
    data: BloodPressureCreate,
) -> int:
    blood_pressure_seq = await blood_pressure_repo.create_blood_pressure(db, user_seq, data)
    await db.commit()
    return blood_pressure_seq


# 혈압 월별 목록 조회
async def get_blood_pressure_list(
    db: AsyncSession,
    user_seq: int,
    year: int,
    month: int,
) -> list[BloodPressureResponse]:
    items = await blood_pressure_repo.get_blood_pressure_list(db, user_seq, year, month)

    return [
        BloodPressureResponse(
            blood_pressure_seq=item.blood_pressure_seq,
            measured_at=item.measured_at,
            systolic=item.systolic,
            diastolic=item.diastolic,
            pulse=item.pulse,
            memo=item.memo,
            level=_classify_level(item.systolic, item.diastolic),
            created_at=item.created_at,
        )
        for item in items
    ]


def _classify_level(systolic: int, diastolic: int) -> BloodPressureLevel:
    # 노인층에 흔한 수축기단독고혈압(수축기만 높고 이완기는 정상/낮음)을 저혈압으로 오판하지 않도록,
    # 고혈압 여부를 저혈압보다 먼저 확인함
    if (
        systolic > settings.blood_pressure_systolic_caution_max
        or diastolic > settings.blood_pressure_diastolic_caution_max
    ):
        return BloodPressureLevel.HIGH
    if (
        systolic < settings.blood_pressure_systolic_low_boundary
        or diastolic < settings.blood_pressure_diastolic_low_boundary
    ):
        return BloodPressureLevel.LOW
    if (
        systolic >= settings.blood_pressure_systolic_normal_max
        or diastolic >= settings.blood_pressure_diastolic_normal_max
    ):
        return BloodPressureLevel.CAUTION

    return BloodPressureLevel.NORMAL
