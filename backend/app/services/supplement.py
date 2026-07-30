from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.concurrency import run_in_threadpool

from app.photo_storage import save_photo
from app.repositories import supplement as supplement_repo
from app.schemas.supplement import SupplementItemCreate, SupplementItemListResponse


# 영양제 등록 (항목 생성 + 스케줄 생성을 하나의 트랜잭션으로 처리)
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
