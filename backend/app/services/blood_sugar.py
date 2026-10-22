from sqlalchemy.ext.asyncio import AsyncSession

from app.config.settings import settings
from app.models.blood_sugar import BloodSugar
from app.models.enums import BloodSugarLevel, CheckTiming
from app.repositories import blood_sugar as blood_sugar_repo
from app.schemas.blood_sugar import BloodSugarCreate, BloodSugarResponse, BloodSugarUpdate


# 혈당 기록 등록
async def create_blood_sugar(
    db: AsyncSession,
    user_seq: int,
    data: BloodSugarCreate,
) -> int:
    blood_sugar_seq = await blood_sugar_repo.create_blood_sugar(db, user_seq, data)
    await db.commit()
    return blood_sugar_seq


# 혈당 월별 목록 조회
async def get_blood_sugar_list(
    db: AsyncSession,
    user_seq: int,
    year: int,
    month: int,
    check_timing: CheckTiming | None,
) -> list[BloodSugarResponse]:
    items = await blood_sugar_repo.get_blood_sugar_list(db, user_seq, year, month, check_timing)

    return [_to_response(item) for item in items]


# 혈당 단건 상세 조회
async def get_blood_sugar(db: AsyncSession, user_seq: int, blood_sugar_seq: int) -> BloodSugarResponse | None:
    item = await blood_sugar_repo.get_blood_sugar(db, user_seq, blood_sugar_seq)

    if item is None:
        return None

    return _to_response(item)


# 혈당 단건 수정
async def update_blood_sugar(
    db: AsyncSession,
    user_seq: int,
    blood_sugar_seq: int,
    data: BloodSugarUpdate,
) -> int | None:
    result = await blood_sugar_repo.update_blood_sugar(db, user_seq, blood_sugar_seq, data)

    if not result:
        return None

    await db.commit()
    return blood_sugar_seq


# 혈당 단건 삭제
async def delete_blood_sugar(
    db: AsyncSession,
    user_seq: int,
    blood_sugar_seq: int,
) -> bool:
    deleted = await blood_sugar_repo.delete_blood_sugar(db, user_seq, blood_sugar_seq)

    if deleted:
        await db.commit()

    return deleted


def _classify_level(check_timing: CheckTiming, glucose_value: int) -> BloodSugarLevel:
    # 공복과 식후 2시간은 정상/주의 기준이 달라 측정 시기별 기준값을 고름 (저혈당 경계는 공통)
    if check_timing == CheckTiming.EMPTY:
        normal_max = settings.blood_sugar_fasting_normal_max
        caution_max = settings.blood_sugar_fasting_caution_max
    else:
        normal_max = settings.blood_sugar_post_meal_normal_max
        caution_max = settings.blood_sugar_post_meal_caution_max

    if glucose_value < settings.blood_sugar_low_boundary:
        return BloodSugarLevel.LOW
    if glucose_value > caution_max:
        return BloodSugarLevel.HIGH
    if glucose_value >= normal_max:
        return BloodSugarLevel.CAUTION

    return BloodSugarLevel.NORMAL


# ORM 모델 → 응답 스키마 변환 (판정 결과 level 포함)
def _to_response(item: BloodSugar) -> BloodSugarResponse:
    return BloodSugarResponse(
        blood_sugar_seq=item.blood_sugar_seq,
        measured_at=item.measured_at,
        check_timing=item.check_timing,
        glucose_value=item.glucose_value,
        memo=item.memo,
        level=_classify_level(item.check_timing, item.glucose_value),
        created_at=item.created_at,
    )
