"""users의 user_id를 user_seq로 변경함

Revision ID: ac0b6529d627
Revises: dd9e6d09ee3d
Create Date: 2026-07-21 14:52:45.317182

"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "ac0b6529d627"
down_revision: Union[str, Sequence[str], None] = "dd9e6d09ee3d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        "users",
        "user_pk",
        new_column_name="user_seq",
        existing_type=sa.Integer(),
        existing_autoincrement=True,
        existing_nullable=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        "users",
        "user_seq",
        new_column_name="user_pk",
        existing_type=sa.Integer(),
        existing_autoincrement=True,
        existing_nullable=False,
    )
