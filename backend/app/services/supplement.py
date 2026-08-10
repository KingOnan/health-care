from datetime import time

from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.concurrency import run_in_threadpool

from app.kst import INTAKE_DAY_START_HOUR, now_kst
from app.models.enums import CheckStatus, SupplementEatStatus
from app.photo_storage import delete_photo, save_photo
from app.repositories import supplement as supplement_repo
from app.schemas.supplement import (
    SupplementItemCreate,
    SupplementItemListResponse,
    SupplementItemResponse,
    SupplementItemUpdate,
    SupplementScheduleResponse,
    SupplementTodayItemResponse,
)


# 영양제 등록 (항목 생성 + 스케줄 생성)
async def create_supplement(
    db: AsyncSession,
    user_seq: int,
    data: SupplementItemCreate,
    photo: UploadFile | None,
) -> int:
    # save_photo는 동기(디스크 I/O) 함수라, 이벤트 루프를 막지 않도록 스레드풀에서 실행
    photo_path = await run_in_threadpool(save_photo, photo) if photo is not None else None

    supplement_item_seq = await supplement_repo.create_supplement_item(db, user_seq, data, photo_path)
    await supplement_repo.create_supplement_schedule(db, supplement_item_seq, data.scheduled_times)

    await db.commit()
    return supplement_item_seq


# 영양제 수정 (항목 수정 + 스케줄 매칭 반영)
async def update_supplement(
    db: AsyncSession,
    user_seq: int,
    supplement_item_seq: int,
    data: SupplementItemUpdate,
    photo: UploadFile | None,
) -> int | None:
    # 항목 소유자가 맞는지 확인
    is_owner = await supplement_repo.check_supplement_item_owner(db, user_seq, supplement_item_seq)

    if not is_owner:
        return None

    # 사진을 교체하는 경우, 기존 파일 경로를 미리 기억해둠 (덮어쓴 뒤엔 알 수 없어지므로)
    old_photo_path = await supplement_repo.get_supplement_item_photo_path(db, user_seq, supplement_item_seq)

    new_photo_path = await run_in_threadpool(save_photo, photo) if photo is not None else None

    updated = await supplement_repo.update_supplement_item(db, user_seq, supplement_item_seq, data, new_photo_path)

    if not updated:
        return None

    # 기존 스케줄과 매칭해서 변경분만 반영 (복용 기록이 참조 중인 스케줄도 안전하게 처리)
    await supplement_repo.update_supplement_schedule(db, supplement_item_seq, data.schedules)
    await db.commit()

    # 새 사진으로 교체된 경우에만, 커밋이 끝난 뒤 더 이상 쓰이지 않는 기존 파일을 정리
    if new_photo_path is not None and old_photo_path is not None:
        await run_in_threadpool(delete_photo, old_photo_path)

    return supplement_item_seq


# 영양제 항목 목록 조회
async def get_supplement_item_list(db: AsyncSession, user_seq: int) -> list[SupplementItemListResponse]:
    items = await supplement_repo.get_supplement_item_list(db, user_seq)

    responses = [
        SupplementItemListResponse(
            supplement_item_seq=item.supplement_item_seq,
            name=item.name,
            status=item.status,
            scheduled_times=[schedule.scheduled_time for schedule in item.schedules],
        )
        for item in items
    ]

    # 복용 시간이 이른 순서대로 정렬 (한 항목에 시간이 여러 개면 그중 제일 이른 시간 기준)
    responses.sort(key=lambda r: min(r.scheduled_times))
    return responses


# 영양제 항목 상세 조회
async def get_supplement_item(
    db: AsyncSession, user_seq: int, supplement_item_seq: int
) -> SupplementItemResponse | None:
    item = await supplement_repo.get_supplement_item(db, user_seq, supplement_item_seq)

    if item is None:
        return None

    return SupplementItemResponse(
        supplement_item_seq=item.supplement_item_seq,
        name=item.name,
        product_name=item.product_name,
        company_name=item.company_name,
        nutrition_info=item.nutrition_info,
        description=item.description,
        photo_path=item.photo_path,
        timing=item.timing,
        status=item.status,
        schedules=[
            SupplementScheduleResponse(
                supplement_schedule_seq=schedule.supplement_schedule_seq,
                scheduled_time=schedule.scheduled_time,
            )
            for schedule in item.schedules
        ],
        created_at=item.created_at,
    )


# 영양제 항목 사진 경로 조회 (소유자 확인 포함)
async def get_supplement_item_photo_path(
    db: AsyncSession,
    user_seq: int,
    supplement_item_seq: int,
) -> str | None:
    return await supplement_repo.get_supplement_item_photo_path(db, user_seq, supplement_item_seq)


# 영양제 삭제
async def delete_supplement(
    db: AsyncSession,
    user_seq: int,
    supplement_item_seq: int,
) -> bool:
    photo_path = await supplement_repo.get_supplement_item_photo_path(db, user_seq, supplement_item_seq)
    deleted = await supplement_repo.delete_supplement(db, user_seq, supplement_item_seq)
    await db.commit()

    if photo_path is not None:
        await run_in_threadpool(delete_photo, photo_path)

    return deleted


# 영양제 복용 상태 변경
async def update_supplement_status(
    db: AsyncSession,
    user_seq: int,
    supplement_item_seq: int,
    status: SupplementEatStatus,
) -> bool:
    updated = await supplement_repo.update_supplement_status(db, user_seq, supplement_item_seq, status)

    if updated:
        await db.commit()

    return updated


_GROUP_ORDER = ["아침", "점심", "저녁", "밤"]
_GROUP_END = {"아침": time(10, 0), "점심": time(17, 0), "저녁": time(21, 0)}


# 시간을 받아 아침/점심/저녁/밤 구분
def _time_group(scheduled_time: time) -> str:
    if time(5, 0) <= scheduled_time < time(10, 0):
        return "아침"  # 05:00 ~ 09:59
    if time(10, 0) <= scheduled_time < time(17, 0):
        return "점심"  # 10:00 ~ 16:59
    if time(17, 0) <= scheduled_time < time(21, 0):
        return "저녁"  # 17:00 ~ 20:59
    return "밤"  # 21:00 ~ 04:59


# 새벽 5시를 하루의 시작으로 보고, "하루가 시작된 후 몇 분이 지났는지"로 환산.
# 자정을 넘긴 시각(예: 02:00)도 이르게 취급되지 않고, 하루의 끝자락(04:59)에 가까운 값으로 계산됨
def _minutes_since_day_start(t: time) -> int:
    total_minutes = t.hour * 60 + t.minute
    return (total_minutes - INTAKE_DAY_START_HOUR * 60) % (24 * 60)


# 이 시간대가 이미 지났는지 확인 ("밤"은 하루의 마지막 시간대라 끝나는 시각이 없어 항상 "안 지남" 처리)
def _is_group_passed(group: str, now: time) -> bool:
    end = _GROUP_END.get(group)  # "밤"은 여기 없어서 None
    if end is None:
        return False
    return _minutes_since_day_start(now) >= _minutes_since_day_start(end)


# 오늘 복용 항목 목록 조회
async def get_supplement_item_today_list(
    db: AsyncSession,
    user_seq: int,
) -> list[SupplementTodayItemResponse]:

    # 1. records(레파지토리가 준 원본 데이터)를 하나씩 돌면서, 각각 시간대 분류·상태·놓침 여부를 계산해서
    #    SupplementTodayItemResponse로 만들고 result에 쌓음 (is_next는 일단 False)
    # 2. result를 정렬 — 지금이 속한 시간대를 맨 앞으로 두고 나머지는 순환 순서로(예: 지금이 저녁이면
    #    저녁→밤→아침→점심), 단 오늘 전체가 전부 체크됐으면 그냥 아침→점심→저녁→밤 고정 순서로 보여줌
    # 3. 정렬된 result를 앞에서부터 훑다가, 안 지났고 미확인인 첫 항목에만 is_next = True 찍고 멈춤

    records = await supplement_repo.get_supplement_item_today_list(db, user_seq)
    now = now_kst().time()

    result = []
    for r in records:
        time_group = _time_group(r.schedule.scheduled_time)  # 아침/점심/저녁/밤
        item_status = r.log.status if r.log is not None else None
        passed = _is_group_passed(time_group, now)  # 시간대가 지났는가?
        result.append(
            SupplementTodayItemResponse(
                supplement_item_seq=r.item.supplement_item_seq,
                supplement_schedule_seq=r.schedule.supplement_schedule_seq,
                supplement_log_seq=r.log.supplement_log_seq if r.log is not None else None,
                name=r.item.name,
                scheduled_time=r.schedule.scheduled_time,
                time_group=time_group,
                status=item_status,
                is_next=False,
                is_missed=passed and item_status is None,
            )
        )

    # 오늘 전체가 전부 체크됐으면("미확인" 항목이 하나도 없으면) 순환 없이 고정 순서로 보여줌
    all_done = all(item.status is not None for item in result)

    # 그룹(아침/점심/저녁/밤)별로 그 안의 항목이 전부 체크됐는지 미리 계산 — 다 끝난 그룹은
    # 로테이션 순서와 무관하게 아직 안 끝난 그룹들보다 뒤로 감
    group_all_done = {
        group: all(item.status is not None for item in result if item.time_group == group) for group in _GROUP_ORDER
    }

    # 지금이 속한 시간대를 맨 앞으로 두고, 나머지는 그 뒤로 순환(예: 지금이 저녁이면 저녁→밤→아침→점심)
    current_group = _time_group(now)
    current_index = _GROUP_ORDER.index(current_group)
    rotated_order = _GROUP_ORDER[current_index:] + _GROUP_ORDER[:current_index]
    group_order = _GROUP_ORDER if all_done else rotated_order

    # 안 끝난 그룹은 로테이션 순서로 먼저, 다 끝난 그룹은 그 뒤에(전체가 다 끝났으면 이 구분은 무의미해짐),
    # 같은 그룹 안에서는 이른 시각 순
    result.sort(
        key=lambda item: (
            False if all_done else group_all_done[item.time_group],  # 그룹이 전부 체크됐는가?
            group_order.index(item.time_group),
            _minutes_since_day_start(item.scheduled_time),  # 정확한 시각(자정을 걸치는 "밤"도 순서가 맞게)
        )
    )

    # 정렬된 순서대로 확인하다가 안 지났고 아직 미확인인 첫 항목 하나만 다음 항목으로 표시
    for item in result:
        if not _is_group_passed(item.time_group, now) and item.status is None:
            item.is_next = True
            break

    return result


# 영양제 복용 체크
async def check_supplement_log(
    db: AsyncSession,
    user_seq: int,
    supplement_schedule_seq: int,
    status: CheckStatus,
) -> bool:
    checked = await supplement_repo.check_supplement_log(db, user_seq, supplement_schedule_seq, status)

    if checked:
        await db.commit()

    return checked


# 영양제 복용 체크 삭제
async def delete_supplement_log(
    db: AsyncSession,
    user_seq: int,
    supplement_log_seq: int,
) -> bool:
    deleted = await supplement_repo.delete_supplement_log(db, user_seq, supplement_log_seq)

    if deleted:
        await db.commit()

    return deleted
