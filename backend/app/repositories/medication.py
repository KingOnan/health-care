from dataclasses import dataclass
from datetime import time

from sqlalchemy import and_, delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import load_only, selectinload

from app.database import execute_and_get_rowcount
from app.kst import intake_today_kst, now_kst
from app.models.enums import CheckStatus, MedicationEatStatus
from app.models.medication_item import MedicationItem
from app.models.medication_log import MedicationLog
from app.models.medication_schedule import MedicationSchedule
from app.schemas.medication import MedicationItemCreate, MedicationItemUpdate, MedicationScheduleUpdate


# 약 등록
async def create_medication_item(
    db: AsyncSession,
    user_seq: int,
    data: MedicationItemCreate,
    photo_path: str | None,
) -> int:
    item = MedicationItem(
        user_seq=user_seq,
        name=data.name,
        product_name=data.product_name,
        company_name=data.company_name,
        nutrition_info=data.nutrition_info,
        description=data.description,
        photo_path=photo_path,
        timing=data.timing,
        status=data.status,
        is_prescription=data.is_prescription,
    )

    db.add(item)
    await db.flush()  # commit은 스케줄까지 함께 저장한 뒤 서비스 계층에서 한 번에 처리
    return item.medication_item_seq


# 약 항목 소유권 확인 (사진 저장 전에 먼저 확인하기 위한 가벼운 조회)
async def check_medication_item_owner(
    db: AsyncSession,
    user_seq: int,
    medication_item_seq: int,
) -> bool:
    result = await db.scalar(
        # fmt: off
        select(MedicationItem.medication_item_seq)
        .where(
            MedicationItem.medication_item_seq == medication_item_seq,
            MedicationItem.user_seq == user_seq,
        )
    )

    return result is not None


# 약 항목의 현재 복용 상태만 조회 (종료된 항목인지 판단하려고 서비스 계층에서 사용)
async def get_medication_item_status(
    db: AsyncSession,
    user_seq: int,
    medication_item_seq: int,
) -> MedicationEatStatus | None:
    return await db.scalar(
        # fmt: off
        select(MedicationItem.status)
        .where(
            MedicationItem.medication_item_seq == medication_item_seq,
            MedicationItem.user_seq == user_seq,
        )
    )


# 약 수정. status는 data가 아니라 별도로 받음 — 종료된 약은 상태를 되돌릴 수 없어서,
# 요청 값을 그대로 쓰지 않고 서비스 계층이 그 규칙까지 적용해 결정한 값을 넘겨줌
async def update_medication_item(
    db: AsyncSession,
    user_seq: int,
    medication_item_seq: int,
    data: MedicationItemUpdate,
    photo_path: str | None,
    status: MedicationEatStatus,
) -> bool:
    item = await db.scalar(
        # fmt: off
        select(MedicationItem)
        .where(
            MedicationItem.medication_item_seq == medication_item_seq,
            MedicationItem.user_seq == user_seq,
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
    item.status = status
    item.is_prescription = data.is_prescription

    return True


# 약 스케줄 등록
async def create_medication_schedule(
    db: AsyncSession,
    medication_item_seq: int,
    scheduled_times: list[time],
) -> None:
    for scheduled_time in scheduled_times:
        schedule = MedicationSchedule(
            medication_item_seq=medication_item_seq,
            scheduled_time=scheduled_time,
        )
        db.add(schedule)

    await db.flush()


# 약 스케줄 수정. medication_schedule_seq가 있으면 기존 행의 시각만 변경(복용 기록이
# 참조 중이어도 안전), 없으면 새로 추가. 요청에 빠진 기존 스케줄만 삭제
async def update_medication_schedule(
    db: AsyncSession,
    medication_item_seq: int,
    schedules: list[MedicationScheduleUpdate],
) -> None:
    # 이 항목에 이미 있는 스케줄들을 seq -> 객체 맵으로 만들어둠 (요청받은 항목과 매칭할 대상)
    existing = await db.scalars(
        # fmt: off
        select(MedicationSchedule)
        .where(MedicationSchedule.medication_item_seq == medication_item_seq)
    )
    existing_by_seq = {schedule.medication_schedule_seq: schedule for schedule in existing}
    kept_seqs: set[int] = set()  # 이번 요청에서 실제로 매칭돼 살아남은(유지된) 기존 스케줄 seq 모음

    for entry in schedules:
        # seq가 있고 그게 기존 스케줄 중 하나면 "같은 슬롯을 수정하는 것"으로 간주
        existing_schedule = (
            existing_by_seq.get(entry.medication_schedule_seq) if entry.medication_schedule_seq is not None else None
        )

        if existing_schedule is not None:
            # 기존 행이면 시각만 바꿔치기 (UPDATE) — 로그가 이 스케줄을 참조 중이어도 삭제가 아니라 안전함
            existing_schedule.scheduled_time = entry.scheduled_time
            kept_seqs.add(existing_schedule.medication_schedule_seq)
        else:
            # seq가 없거나(신규 입력) 매칭되는 기존 행이 없으면 새 스케줄로 INSERT
            db.add(
                MedicationSchedule(
                    medication_item_seq=medication_item_seq,
                    scheduled_time=entry.scheduled_time,
                )
            )

    # 원래 있었는데 이번 요청에 포함 안 된(=매칭 안 된) 스케줄은 사용자가 지운 것으로 보고 삭제
    removed_seqs = set(existing_by_seq.keys()) - kept_seqs

    if removed_seqs:
        await db.execute(
            # fmt: off
            delete(MedicationSchedule)
            .where(MedicationSchedule.medication_schedule_seq.in_(removed_seqs))
        )

    await db.flush()


# 약 항목 목록 조회 (스케줄 포함)
async def get_medication_item_list(db: AsyncSession, user_seq: int) -> list[MedicationItem]:
    result = await db.scalars(
        # fmt: off
        select(MedicationItem)
        .where(MedicationItem.user_seq == user_seq)
        .options(
            # 엔티티 자체는 select하되, 실제로 DB에서 가져올 컬럼은 이것만으로 제한
            load_only(
                MedicationItem.name,
                MedicationItem.medication_item_seq,
                MedicationItem.status,
            ),
            # 스케줄도 IN 쿼리로 한 번에 미리 로딩(N+1 방지), 그중 시간 컬럼만
            selectinload(
                MedicationItem.schedules,
            ).options(
                load_only(MedicationSchedule.scheduled_time),
            ),
        )
    )

    return list(result.all())


# 약 항목 상세 조회 (스케줄 포함)
async def get_medication_item(
    db: AsyncSession,
    user_seq: int,
    medication_item_seq: int,
) -> MedicationItem | None:
    result = await db.scalar(
        # fmt: off
        select(MedicationItem)
        .where(
            MedicationItem.medication_item_seq == medication_item_seq,
            MedicationItem.user_seq == user_seq,
        )
        .options(selectinload(MedicationItem.schedules).options(load_only(MedicationSchedule.scheduled_time)))
    )

    return result


# 약 항목 사진 경로 조회 (소유자 확인 포함)
async def get_medication_item_photo_path(
    db: AsyncSession,
    user_seq: int,
    medication_item_seq: int,
) -> str | None:
    return await db.scalar(
        # fmt: off
        select(MedicationItem.photo_path)
        .where(
            MedicationItem.medication_item_seq == medication_item_seq,
            MedicationItem.user_seq == user_seq,
        )
    )


# 약 삭제 (cascade)
async def delete_medication(
    db: AsyncSession,
    user_seq: int,
    medication_item_seq: int,
) -> bool:
    rowcount = await execute_and_get_rowcount(
        db,
        # fmt: off
        delete(MedicationItem)
        .where(
            MedicationItem.user_seq == user_seq,
            MedicationItem.medication_item_seq == medication_item_seq,
        ),
    )

    return rowcount > 0


# 약 복용 상태 변경. 넘겨받은 status는 서비스 계층이 종료 규칙까지 적용해 결정한 값
async def update_medication_status(
    db: AsyncSession,
    user_seq: int,
    medication_item_seq: int,
    status: MedicationEatStatus,
) -> bool:
    data = await db.scalar(
        # fmt: off
        select(MedicationItem).where(
            MedicationItem.user_seq == user_seq,
            MedicationItem.medication_item_seq == medication_item_seq
        )
    )

    if data is None:
        return False

    data.status = status

    return True


# 오늘 복용 항목 목록 조회에서 스케줄 하나(=오늘의 occurrence 하나)를 표현
@dataclass(frozen=True)
class TodayMedicationRecord:
    schedule: MedicationSchedule
    item: MedicationItem
    log: MedicationLog | None


# 약 오늘 복용 항목 목록 조회
async def get_medication_item_today_list(
    db: AsyncSession,
    user_seq: int,
) -> list[TodayMedicationRecord]:
    today = intake_today_kst()

    result = await db.execute(
        # fmt: off
        select(MedicationSchedule, MedicationItem, MedicationLog)
        .join(
            MedicationItem,
            MedicationSchedule.medication_item_seq == MedicationItem.medication_item_seq
        )
        .outerjoin(
            MedicationLog,
            and_(
                MedicationLog.medication_schedule_seq == MedicationSchedule.medication_schedule_seq,
                MedicationLog.log_date == today,
            ),
        )
        .where(
            MedicationItem.user_seq == user_seq,
            MedicationItem.status == MedicationEatStatus.ING,
        )
    )

    return [
        TodayMedicationRecord(
            schedule=schedule,
            item=item,
            log=log,
        )
        for schedule, item, log in result.tuples()
    ]


# 약 복용 체크
async def check_medication_log(
    db: AsyncSession,
    user_seq: int,
    medication_schedule_seq: int,
    status: CheckStatus,
) -> bool:
    # 이 스케줄이 로그인한 유저 소유이면서 복용중인지 확인 (중지/종료된 항목은 체크 대상이 아님)
    is_mine = await db.scalar(
        # fmt: off
        select(MedicationSchedule.medication_schedule_seq)
        .join(MedicationItem, MedicationSchedule.medication_item_seq == MedicationItem.medication_item_seq)
        .where(
            MedicationSchedule.medication_schedule_seq == medication_schedule_seq,
            MedicationItem.user_seq == user_seq,
            MedicationItem.status == MedicationEatStatus.ING,
        )
    )

    if is_mine is None:
        return False

    today = intake_today_kst()

    # medication_schedule_seq + log_date로 조회
    existing = await db.scalar(
        # fmt: off
        select(MedicationLog)
        .where(
            MedicationLog.medication_schedule_seq == medication_schedule_seq,
            MedicationLog.log_date == today,
        )
    )

    if existing is None:
        # 존재하지 않으면 insert
        db.add(
            MedicationLog(
                medication_schedule_seq=medication_schedule_seq,
                log_date=today,
                status=status,
                actual_time=now_kst().time(),
            )
        )
    else:
        # 존재하면 update
        existing.status = status
        existing.actual_time = now_kst().time()

    return True


# 약 복용 체크 삭제
async def delete_medication_log(
    db: AsyncSession,
    user_seq: int,
    medication_log_seq: int,
) -> bool:
    existing = await db.scalar(
        # fmt: off
        select(MedicationLog)
        .join(
            MedicationSchedule,
            MedicationSchedule.medication_schedule_seq == MedicationLog.medication_schedule_seq
        )
        .join(
            MedicationItem,
            and_(
                MedicationItem.medication_item_seq == MedicationSchedule.medication_item_seq,
                MedicationItem.user_seq == user_seq
            )
        )
        .where(
            MedicationLog.medication_log_seq == medication_log_seq
        )
    )

    if existing is None:
        return False

    await db.delete(existing)

    return True
