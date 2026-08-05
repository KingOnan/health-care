from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.concurrency import run_in_threadpool

from app.photo_storage import delete_photo, save_photo
from app.repositories import supplement as supplement_repo
from app.schemas.supplement import (
    SupplementItemCreate,
    SupplementItemListResponse,
    SupplementItemResponse,
    SupplementItemUpdate,
    SupplementScheduleResponse,
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

    if not deleted:
        return False

    await db.commit()

    if photo_path is not None:
        await run_in_threadpool(delete_photo, photo_path)

    return True
