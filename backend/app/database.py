from collections.abc import AsyncGenerator
from typing import Any

from sqlalchemy import event
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
