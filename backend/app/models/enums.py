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


# 약, 영양제 하루 복용 체크 상태 (미확인은 값으로 두지 않음 — 로그 행이 없는 것 자체가 미확인이라,
# 응답에서는 이 필드가 None으로 표현됨)
class CheckStatus(str, enum.Enum):
    DONE = "복용완료"
    SKIPPED = "건너뛰기"


# 혈압 4단계 판정 결과
class BloodPressureLevel(str, enum.Enum):
    LOW = "저혈압"
    NORMAL = "정상"
    CAUTION = "주의"
    HIGH = "고혈압"
