from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.supplement import SupplementItemCreate, SupplementItemListResponse
from app.security import get_current_user
from app.services import supplement as supplement_service

router = APIRouter(prefix="/supplement", tags=["영양제"])


# 영양제 등록 (항목 데이터는 JSON 문자열 하나로, 사진은 별도 파일로 받음)
@router.post("/create", response_model=int)
async def create_supplement(
    data: Annotated[str, Form()],  # JSON 바디가 아닌 멀티파트 폼에서 온다는 뜻 (파싱 안된 문자열째로 받음)
    photo: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> int:
    try:
        # 스키마 형태로 파싱하고 검증
        parsedSupplementItemCreate = SupplementItemCreate.model_validate_json(data)

    except ValidationError as e:
        # 검증 실패시 클라이언트 잘못인데 서버 에러(500)가 발생하기 때문에 이를 422 에러로 처리
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=e.errors())

    return await supplement_service.create_supplement(db, current_user.user_seq, parsedSupplementItemCreate, photo)


# 영양제 항목 목록 조회
@router.get("/list", response_model=list[SupplementItemListResponse])
async def get_supplement_item_list(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[SupplementItemListResponse]:
    return await supplement_service.get_supplement_item_list(db, current_user.user_seq)
