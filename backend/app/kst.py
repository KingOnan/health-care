from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

from app.config.settings import settings

_tz = ZoneInfo(settings.timezone)

# 복용 기록에서 "하루"의 시작 시각. 자정이 아니라 새벽 4시로 봐서, 21:00~04:59 "밤" 시간대에
# 자정을 넘겨 체크해도 전날 밤 기록으로 잡히게 함 (_time_group의 "밤" 경계와 동일한 기준)
_INTAKE_DAY_START_HOUR = 5


# 서버가 어느 시간대에 떠 있든 상관없이, 항상 한국 기준 현재 시각을 반환
def now_kst() -> datetime:
    return datetime.now(_tz)


# 한국 기준 오늘 날짜 (자정 기준 날짜 경계 판정용, 달력상의 실제 오늘)
def today_kst() -> date:
    return now_kst().date()


# 복용 기록 전용 "오늘" 날짜. 새벽 5시 이전이면 전날 날짜를 반환 (자정을 걸치는 밤 시간대 보정)
def intake_today_kst() -> date:
    now = now_kst()
    if now.hour < _INTAKE_DAY_START_HOUR:
        return (now - timedelta(days=1)).date()
    return now.date()
