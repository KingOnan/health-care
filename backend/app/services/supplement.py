from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.concurrency import run_in_threadpool

from app.photo_storage import save_photo
from app.repositories import supplement as supplement_repo
from app.schemas.supplement import SupplementItemCreate


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
