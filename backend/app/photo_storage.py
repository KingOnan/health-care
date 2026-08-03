import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.config.settings import settings


# 업로드된 사진 파일을 저장하고, 저장된 경로를 반환
def save_photo(photo: UploadFile) -> str:
    # content_type이 "image/"로 시작하지 않으면(사진이 아니면) 400 에러를 던짐
    # photo.content_type이 None일 수도 있어서 "or \"\"\"로 빈 문자열로 대체해 에러 방지
    if not (photo.content_type or "").startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미지 파일만 업로드할 수 있습니다",
        )

    # 설정값(문자열)을 Path 객체로 변환
    upload_dir = Path(settings.upload_dir)

    # 폴더가 없으면 만듦 (parents=True: 중간 폴더도 함께, exist_ok=True: 이미 있어도 에러 안 남)
    upload_dir.mkdir(parents=True, exist_ok=True)

    # 원본 파일명에서 확장자만 뽑음 (예: "photo.jpg" -> ".jpg")
    extension = Path(photo.filename or "").suffix

    # "uploads/무작위UUID.jpg" 형태의 새 경로 생성 (원본 파일명 그대로 안 쓰는 이유: 이름 충돌/보안 방지)
    saved_path = upload_dir / f"{uuid.uuid4()}{extension}"

    # 업로드된 파일의 실제 바이너리 내용을 읽어서 그 경로에 저장
    saved_path.write_bytes(photo.file.read())

    # 항상 슬래시(/) 구분자로 반환 (윈도우에서 개발해도, 배포 환경인 리눅스에서도 경로가 똑같이 저장되도록)
    return saved_path.as_posix()


# 더 이상 참조되지 않는 사진 파일을 삭제 (예: 수정 시 새 사진으로 교체된 기존 파일 정리)
def delete_photo(path: str) -> None:
    # missing_ok=True: 파일이 이미 없어도 에러 없이 그냥 넘어감
    Path(path).unlink(missing_ok=True)
