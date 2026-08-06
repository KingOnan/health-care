from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.supplement import (
    SupplementItemCreate,
    SupplementItemListResponse,
    SupplementItemResponse,
    SupplementItemUpdate,
    SupplementStatusUpdate,
    SupplementTodayItemResponse,
)
from app.security import get_current_user
from app.services import supplement as supplement_service

router = APIRouter(prefix="/supplement", tags=["영양제"])


# 영양제 등록 (항목 데이터는 JSON 문자열 하나로, 사진은 별도 파일로 받음)
@router.post("/create", response_model=ApiResponse[int])
async def create_supplement(
    data: Annotated[str, Form()],  # JSON 바디가 아닌 멀티파트 폼에서 온다는 뜻 (파싱 안된 문자열째로 받음)
    photo: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[int]:
    try:
        # 스키마 형태로 파싱하고 검증
        parsedSupplementItemCreate = SupplementItemCreate.model_validate_json(data)

    except ValidationError as e:
        # 검증 실패시 클라이언트 잘못인데 서버 에러(500)가 발생하기 때문에 이를 422 에러로 처리
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=e.errors())

    supplement_item_seq = await supplement_service.create_supplement(
        db, current_user.user_seq, parsedSupplementItemCreate, photo
    )
    return ApiResponse(data=supplement_item_seq)


# 영양제 수정
@router.post("/update/{supplement_item_seq}", response_model=ApiResponse[int])
async def update_supplement(
    supplement_item_seq: int,
    data: Annotated[str, Form()],  # JSON 바디가 아닌 멀티파트 폼에서 온다는 뜻 (파싱 안된 문자열째로 받음)
    photo: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[int]:
    try:
        # 스키마 형태로 파싱하고 검증
        parsedSupplementItemUpdate = SupplementItemUpdate.model_validate_json(data)

    except ValidationError as e:
        # 검증 실패시 클라이언트 잘못인데 서버 에러(500)가 발생하기 때문에 이를 422 에러로 처리
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=e.errors())

    result = await supplement_service.update_supplement(
        db, current_user.user_seq, supplement_item_seq, parsedSupplementItemUpdate, photo
    )

    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="영양제 항목을 찾을 수 없습니다.")

    return ApiResponse(data=result)


# 영양제 항목 목록 조회
@router.get("/list", response_model=ApiResponse[list[SupplementItemListResponse]])
async def get_supplement_item_list(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[list[SupplementItemListResponse]]:
    items = await supplement_service.get_supplement_item_list(db, current_user.user_seq)
    return ApiResponse(data=items)


# 영양제 항목 상세 조회
@router.get("/{supplement_item_seq}", response_model=ApiResponse[SupplementItemResponse])
async def get_supplement_item(
    supplement_item_seq: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[SupplementItemResponse]:
    result = await supplement_service.get_supplement_item(db, current_user.user_seq, supplement_item_seq)

    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="영양제 항목을 찾을 수 없습니다.")

    return ApiResponse(data=result)


# 영양제 항목 사진 조회 (소유자 확인 후 파일로 응답)
@router.get("/{supplement_item_seq}/photo")
async def get_supplement_item_photo(
    supplement_item_seq: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FileResponse:
    photo_path = await supplement_service.get_supplement_item_photo_path(db, current_user.user_seq, supplement_item_seq)

    if photo_path is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="사진을 찾을 수 없습니다.")

    # URL은 항목 ID로 고정이라, 사진이 교체돼도 브라우저가 예전 응답을 캐싱해 재사용하지 않도록 방지
    return FileResponse(photo_path, headers={"Cache-Control": "no-store"})


# 영양제 삭제 (스케줄/복용 기록은 DB에서 cascade로 함께 삭제됨)
@router.delete("/{supplement_item_seq}", response_model=ApiResponse[int])
async def delete_supplement(
    supplement_item_seq: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[int]:
    deleted = await supplement_service.delete_supplement(db, current_user.user_seq, supplement_item_seq)

    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="영양제 항목을 찾을 수 없습니다.")

    return ApiResponse(data=supplement_item_seq)


# 영양제 복용 상태 변경
@router.post("/update/status/{supplement_item_seq}", response_model=ApiResponse[None])
async def update_supplement_status(
    supplement_item_seq: int,
    data: SupplementStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[None]:
    updated = await supplement_service.update_supplement_status(
        db, current_user.user_seq, supplement_item_seq, data.status
    )

    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="영양제 항목을 찾을 수 없습니다.")

    return ApiResponse()


# 오늘 복용 항목 목록 조회
@router.get("/today/list", response_model=ApiResponse[list[SupplementTodayItemResponse]])
async def get_supplement_item_today_list(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[list[SupplementTodayItemResponse]]:
    items = await supplement_service.get_supplement_item_today_list(db, current_user.user_seq)
    return ApiResponse(data=items)
