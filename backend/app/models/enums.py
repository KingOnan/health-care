import enum


# 약, 영양제 복용 시기
class EatTiming(str, enum.Enum):
    EMPTY = "공복"
    BEFORE = "식전"
    AFTER = "식후"


# 약 복용 상태
class MedicationEatStatus(str, enum.Enum):
    ING = "복용중"
    PAUSE = "중지"
    END = "종료"


# 영양제 복용 상태 (약과 달리 종료 개념이 없음 — 완전히 그만 먹는 경우는 삭제로 처리)
class SupplementEatStatus(str, enum.Enum):
    ING = "복용중"
    PAUSE = "중지"


# 혈당 측정 시기
class CheckTiming(str, enum.Enum):
    EMPTY = "공복"
    AFTER_2H = "식후 2시간"


# 약, 영양제 하루 복용 체크 상태
class CheckStatus(str, enum.Enum):
    UNCHECKED = "미확인"
    DONE = "복용완료"
    SKIPPED = "건너뛰기"
