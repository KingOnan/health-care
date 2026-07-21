from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool

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


def run_migrations_online() -> None:
    # DB에 실제로 연결해서 마이그레이션을 실행함
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


run_migrations_online()
