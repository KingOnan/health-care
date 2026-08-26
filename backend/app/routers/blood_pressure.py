from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.blood_pressure import BloodPressureCreate
from app.schemas.common import ApiResponse
from app.security import get_current_user
from app.services import blood_pressure as blood_pressure_service

router = APIRouter(prefix="/blood-pressure", tags=["혈압"])


# 혈압 기록 등록
@router.post("/create", response_model=ApiResponse[int])
async def create_blood_pressure(
    data: BloodPressureCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[int]:
    blood_pressure_seq = await blood_pressure_service.create_blood_pressure(db, current_user.user_seq, data)
    return ApiResponse(data=blood_pressure_seq)
