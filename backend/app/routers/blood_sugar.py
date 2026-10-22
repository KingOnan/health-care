from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.enums import CheckTiming
from app.models.user import User
from app.schemas.blood_sugar import BloodSugarCreate, BloodSugarResponse, BloodSugarUpdate
from app.schemas.common import ApiResponse
from app.security import get_current_user
from app.services import blood_sugar as blood_sugar_service

router = APIRouter(prefix="/blood-sugar", tags=["혈당"])


# 혈당 기록 등록
@router.post("/create", response_model=ApiResponse[int])
async def create_blood_sugar(
    data: BloodSugarCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[int]:
    blood_sugar_seq = await blood_sugar_service.create_blood_sugar(db, current_user.user_seq, data)
    return ApiResponse(data=blood_sugar_seq)


# 혈당 월별 목록 조회 (check_timing을 빼면 전체, 넣으면 해당 측정 시기만)
@router.get("/list", response_model=ApiResponse[list[BloodSugarResponse]])
async def get_blood_sugar_list(
    year: int = Query(..., ge=2000, le=2100),
    month: int = Query(..., ge=1, le=12),
    check_timing: CheckTiming | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[list[BloodSugarResponse]]:
    items = await blood_sugar_service.get_blood_sugar_list(
        db,
        current_user.user_seq,
        year,
        month,
        check_timing,
    )

    return ApiResponse(data=items)


# 혈당 단건 상세 조회
@router.get("/{blood_sugar_seq}", response_model=ApiResponse[BloodSugarResponse])
async def get_blood_sugar(
    blood_sugar_seq: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[BloodSugarResponse]:
    result = await blood_sugar_service.get_blood_sugar(db, current_user.user_seq, blood_sugar_seq)

    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="혈당 기록을 찾을 수 없습니다.")

    return ApiResponse(data=result)


# 혈당 단건 수정
@router.post("/update/{blood_sugar_seq}", response_model=ApiResponse[int])
async def update_blood_sugar(
    blood_sugar_seq: int,
    data: BloodSugarUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[int]:
    result = await blood_sugar_service.update_blood_sugar(db, current_user.user_seq, blood_sugar_seq, data)

    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="혈당 기록을 찾을 수 없습니다.")

    return ApiResponse(data=result)


# 혈당 단건 삭제
@router.delete("/{blood_sugar_seq}", response_model=ApiResponse[None])
async def delete_blood_sugar(
    blood_sugar_seq: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[None]:
    deleted = await blood_sugar_service.delete_blood_sugar(db, current_user.user_seq, blood_sugar_seq)

    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="혈당 기록을 찾을 수 없습니다.")

    return ApiResponse()
