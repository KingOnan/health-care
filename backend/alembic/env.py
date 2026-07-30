import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# autogenerate가 감지하려면 모델이 먼저 import돼서 metadata에 등록돼 있어야 함
from app import models  # noqa: F401
from app.config.settings import settings
from app.database import Base

config = context.config

# .env의 DATABASE_URL을 그대로 사용 (alembic.ini에는 URL을 안 적어둠)
config.set_main_option("sqlalchemy.url", settings.database_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# autogenerate가 우리 모델들과 비교할 수 있도록 Base.metadata를 연결
target_metadata = Base.metadata


# 마이그레이션 실행 자체는 동기 방식이라, 비동기 커넥션 위에서 동기 함수로 감싸 실행
def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    # DB에 실제로 연결해서 마이그레이션을 실행함 (엔진은 비동기 드라이버 그대로 사용)
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


asyncio.run(run_migrations_online())
