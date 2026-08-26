"""blood_sugar_records → blood_sugars로 테이블명 정리 (record 제거)

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-08-26 00:00:01.000000

"""

from typing import Sequence, Union

from sqlalchemy.dialects import mysql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "b2c3d4e5f6a7"
down_revision: Union[str, Sequence[str], None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.rename_table("blood_sugar_records", "blood_sugars")
    op.alter_column(
        "blood_sugars",
        "blood_sugar_record_seq",
        new_column_name="blood_sugar_seq",
        existing_type=mysql.INTEGER(),
        existing_comment="혈당 기록 기본키",
        existing_nullable=False,
        existing_autoincrement=True,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        "blood_sugars",
        "blood_sugar_seq",
        new_column_name="blood_sugar_record_seq",
        existing_type=mysql.INTEGER(),
        existing_comment="혈당 기록 기본키",
        existing_nullable=False,
        existing_autoincrement=True,
    )
    op.rename_table("blood_sugars", "blood_sugar_records")
