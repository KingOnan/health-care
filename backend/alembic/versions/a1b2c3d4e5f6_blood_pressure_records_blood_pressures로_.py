"""blood_pressure_records → blood_pressures로 테이블명 정리 (record 제거)

Revision ID: a1b2c3d4e5f6
Revises: e0ce9a9c641a
Create Date: 2026-08-26 00:00:00.000000

"""

from typing import Sequence, Union

from sqlalchemy.dialects import mysql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "e0ce9a9c641a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.rename_table("blood_pressure_records", "blood_pressures")
    op.alter_column(
        "blood_pressures",
        "blood_pressure_record_seq",
        new_column_name="blood_pressure_seq",
        existing_type=mysql.INTEGER(),
        existing_comment="혈압 기록 기본키",
        existing_nullable=False,
        existing_autoincrement=True,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        "blood_pressures",
        "blood_pressure_seq",
        new_column_name="blood_pressure_record_seq",
        existing_type=mysql.INTEGER(),
        existing_comment="혈압 기록 기본키",
        existing_nullable=False,
        existing_autoincrement=True,
    )
    op.rename_table("blood_pressures", "blood_pressure_records")
