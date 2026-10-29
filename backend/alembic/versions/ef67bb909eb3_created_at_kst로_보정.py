"""created_at KST로 보정

Revision ID: ef67bb909eb3
Revises: 84b161a20133
Create Date: 2026-10-29 16:58:42.280020

"""

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "ef67bb909eb3"
down_revision: Union[str, Sequence[str], None] = "84b161a20133"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# created_at이 있는 테이블 (DB 시간대가 UTC일 때 저장된 값을 KST로 보정)
TABLES = [
    "users",
    "supplement_items",
    "supplement_logs",
    "medication_items",
    "medication_logs",
    "blood_pressures",
    "blood_sugars",
]


def upgrade() -> None:
    """Upgrade schema."""
    for table in TABLES:
        op.execute(f"UPDATE {table} SET created_at = created_at + INTERVAL 9 HOUR")


def downgrade() -> None:
    """Downgrade schema."""
    for table in TABLES:
        op.execute(f"UPDATE {table} SET created_at = created_at - INTERVAL 9 HOUR")
