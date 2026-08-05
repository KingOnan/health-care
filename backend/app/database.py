from collections.abc import AsyncGenerator
from typing import Any

from sqlalchemy import Executable, event
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config.settings import settings

engine = create_async_engine(settings.database_url)
SessionLocal = async_sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

if settings.database_echo:
    # echo=True는 파라미터/트랜잭션 로그까지 다 찍혀서 너무 시끄러움 -> 실제 실행되는 SQL 텍스트만 출력
    @event.listens_for(engine.sync_engine, "before_cursor_execute")
    def _log_query(
        conn: Connection, cursor: Any, statement: str, parameters: Any, context: Any, executemany: bool
    ) -> None:
        print(f"\n{statement}")


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as db:
        yield db


# update/delete문 실행 후 실제로 반영된 행 개수를 반환 (존재/소유 확인용).
# AsyncSession.execute()의 리턴 타입이 SELECT/DML을 모두 아우르는 넓은 타입이라 mypy가
# rowcount를 못 찾는 문제가 있어서, 이 우회 처리를 여기 한 곳에만 모아둠
async def execute_and_get_rowcount(db: AsyncSession, statement: Executable) -> int:
    result = await db.execute(statement)
    return result.rowcount  # type: ignore[attr-defined]
