import enum


# 약, 영양제 복용 시기
class EatTiming(str, enum.Enum):
    EMPTY = "공복"
    BEFORE = "식전"
    AFTER = "식후"


# 약, 영양제 복용 상태
class EatStatus(str, enum.Enum):
    ING = "복용중"
    PAUSE = "일시중지"
    END = "종료"


# 혈당 측정 시기
class CheckTiming(str, enum.Enum):
    EMPTY = "공복"
    AFTER_2H = "식후 2시간"
