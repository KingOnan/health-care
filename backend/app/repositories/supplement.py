from datetime import time

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import load_only, selectinload

from app.database import execute_and_get_rowcount
from app.models.enums import SupplementEatStatus
from app.models.supplement_item import SupplementItem
from app.models.supplement_schedule import SupplementSchedule
from app.schemas.supplement import SupplementItemCreate, SupplementItemUpdate, SupplementScheduleUpdate


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
        status=data.status,
    )

    db.add(item)
    await db.flush()  # commit은 스케줄까지 함께 저장한 뒤 서비스 계층에서 한 번에 처리
    return item.supplement_item_seq


# 영양제 항목 소유권 확인 (사진 저장 전에 먼저 확인하기 위한 가벼운 조회)
async def check_supplement_item_owner(
    db: AsyncSession,
    user_seq: int,
    supplement_item_seq: int,
) -> bool:
    result = await db.scalar(
        # fmt: off
        select(SupplementItem.supplement_item_seq)
        .where(
            SupplementItem.supplement_item_seq == supplement_item_seq,
            SupplementItem.user_seq == user_seq,
        )
    )

    return result is not None


# 영양제 수정
async def update_supplement_item(
    db: AsyncSession,
    user_seq: int,
    supplement_item_seq: int,
    data: SupplementItemUpdate,
    photo_path: str | None,
) -> bool:
    item = await db.scalar(
        # fmt: off
        select(SupplementItem)
        .where(
            SupplementItem.supplement_item_seq == supplement_item_seq,
            SupplementItem.user_seq == user_seq,
        )
    )

    if item is None:
        return False

    item.name = data.name
    item.product_name = data.product_name
    item.company_name = data.company_name
    item.nutrition_info = data.nutrition_info
    item.description = data.description
    item.photo_path = photo_path if photo_path is not None else item.photo_path
    item.timing = data.timing
    item.status = data.status

    return True


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


# 영양제 스케줄 수정. supplement_schedule_seq가 있으면 기존 행의 시각만 변경(복용 기록이
# 참조 중이어도 안전), 없으면 새로 추가. 요청에 빠진 기존 스케줄만 삭제
async def update_supplement_schedule(
    db: AsyncSession,
    supplement_item_seq: int,
    schedules: list[SupplementScheduleUpdate],
) -> None:
    # 이 항목에 이미 있는 스케줄들을 seq -> 객체 맵으로 만들어둠 (요청받은 항목과 매칭할 대상)
    existing = await db.scalars(
        # fmt: off
        select(SupplementSchedule)
        .where(SupplementSchedule.supplement_item_seq == supplement_item_seq)
    )
    existing_by_seq = {schedule.supplement_schedule_seq: schedule for schedule in existing}
    kept_seqs: set[int] = set()  # 이번 요청에서 실제로 매칭돼 살아남은(유지된) 기존 스케줄 seq 모음

    for entry in schedules:
        # seq가 있고 그게 기존 스케줄 중 하나면 "같은 슬롯을 수정하는 것"으로 간주
        existing_schedule = (
            existing_by_seq.get(entry.supplement_schedule_seq) if entry.supplement_schedule_seq is not None else None
        )

        if existing_schedule is not None:
            # 기존 행이면 시각만 바꿔치기 (UPDATE) — 로그가 이 스케줄을 참조 중이어도 삭제가 아니라 안전함
            existing_schedule.scheduled_time = entry.scheduled_time
            kept_seqs.add(existing_schedule.supplement_schedule_seq)
        else:
            # seq가 없거나(신규 입력) 매칭되는 기존 행이 없으면 새 스케줄로 INSERT
            db.add(
                SupplementSchedule(
                    supplement_item_seq=supplement_item_seq,
                    scheduled_time=entry.scheduled_time,
                )
            )

    # 원래 있었는데 이번 요청에 포함 안 된(=매칭 안 된) 스케줄은 사용자가 지운 것으로 보고 삭제
    removed_seqs = set(existing_by_seq.keys()) - kept_seqs

    if removed_seqs:
        await db.execute(
            # fmt: off
            delete(SupplementSchedule)
            .where(SupplementSchedule.supplement_schedule_seq.in_(removed_seqs))
        )

    await db.flush()


# 영양제 항목 목록 조회 (스케줄 포함)
async def get_supplement_item_list(db: AsyncSession, user_seq: int) -> list[SupplementItem]:
    result = await db.scalars(
        # fmt: off
        select(SupplementItem)
        .where(SupplementItem.user_seq == user_seq)
        .options(
            # 엔티티 자체는 select하되, 실제로 DB에서 가져올 컬럼은 이것만으로 제한
            load_only(
                SupplementItem.name,
                SupplementItem.supplement_item_seq,
                SupplementItem.status,
            ),
            # 스케줄도 IN 쿼리로 한 번에 미리 로딩(N+1 방지), 그중 시간 컬럼만
            selectinload(
                SupplementItem.schedules,
            ).options(
                load_only(SupplementSchedule.scheduled_time),
            ),
        )
    )

    return list(result.all())


# 영양제 항목 상세 조회 (스케줄 포함)
async def get_supplement_item(
    db: AsyncSession,
    user_seq: int,
    supplement_item_seq: int,
) -> SupplementItem | None:
    result = await db.scalar(
        # fmt: off
        select(SupplementItem)
        .where(
            SupplementItem.supplement_item_seq == supplement_item_seq,
            SupplementItem.user_seq == user_seq,
        )
        .options(selectinload(SupplementItem.schedules).options(load_only(SupplementSchedule.scheduled_time)))
    )

    return result


# 영양제 항목 사진 경로 조회 (소유자 확인 포함)
async def get_supplement_item_photo_path(
    db: AsyncSession,
    user_seq: int,
    supplement_item_seq: int,
) -> str | None:
    return await db.scalar(
        # fmt: off
        select(SupplementItem.photo_path)
        .where(
            SupplementItem.supplement_item_seq == supplement_item_seq,
            SupplementItem.user_seq == user_seq,
        )
    )


# 영양제 삭제 (cascade)
async def delete_supplement(
    db: AsyncSession,
    user_seq: int,
    supplement_item_seq: int,
) -> bool:
    rowcount = await execute_and_get_rowcount(
        db,
        # fmt: off
        delete(SupplementItem)
        .where(
            SupplementItem.user_seq == user_seq,
            SupplementItem.supplement_item_seq == supplement_item_seq,
        ),
    )

    return rowcount > 0


# 영양제 복용 상태 변경
async def update_supplement_status(
    db: AsyncSession,
    user_seq: int,
    supplement_item_seq: int,
    status: SupplementEatStatus,
) -> bool:
    data = await db.scalar(
        # fmt: off
        select(SupplementItem).where(
            SupplementItem.user_seq == user_seq,
            SupplementItem.supplement_item_seq == supplement_item_seq
        )
    )

    if data is None:
        return False

    data.status = status

    return True
