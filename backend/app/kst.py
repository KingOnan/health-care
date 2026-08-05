from datetime import date, datetime
from zoneinfo import ZoneInfo

from app.config.settings import settings

_tz = ZoneInfo(settings.timezone)


# 서버가 어느 시간대에 떠 있든 상관없이, 항상 한국 기준 현재 시각을 반환
def now_kst() -> datetime:
    return datetime.now(_tz)


# 한국 기준 오늘 날짜 (자정 기준 날짜 경계 판정용)
def today_kst() -> date:
    return now_kst().date()
