"""users, medication_items, medication_schedules 컬럼 코멘트 추가

Revision ID: bd514ccfd36d
Revises: 019dc14c09e9
Create Date: 2026-07-22 16:27:10.792331

"""

from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import mysql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "bd514ccfd36d"
down_revision: Union[str, Sequence[str], None] = "019dc14c09e9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        "medication_items",
        "medication_item_seq",
        existing_type=mysql.INTEGER(),
        comment="약 기본키",
        existing_nullable=False,
        autoincrement=True,
    )
    op.alter_column(
        "medication_items",
        "name",
        existing_type=mysql.VARCHAR(collation="utf8mb4_unicode_ci", length=50),
        comment="명칭(이름)",
        existing_nullable=False,
    )
    op.alter_column(
        "medication_items",
        "product_name",
        existing_type=mysql.VARCHAR(collation="utf8mb4_unicode_ci", length=50),
        comment="제품명",
        existing_nullable=True,
    )
    op.alter_column(
        "medication_items",
        "company_name",
        existing_type=mysql.VARCHAR(collation="utf8mb4_unicode_ci", length=50),
        comment="회사명",
        existing_nullable=True,
    )
    op.alter_column(
        "medication_items",
        "nutrition_info",
        existing_type=mysql.VARCHAR(collation="utf8mb4_unicode_ci", length=500),
        comment="함량/영양정보",
        existing_nullable=True,
    )
    op.alter_column(
        "medication_items",
        "description",
        existing_type=mysql.VARCHAR(collation="utf8mb4_unicode_ci", length=500),
        comment="설명",
        existing_nullable=True,
    )
    op.alter_column(
        "medication_items",
        "photo_path",
        existing_type=mysql.VARCHAR(collation="utf8mb4_unicode_ci", length=255),
        comment="사진 경로",
        existing_nullable=True,
    )
    op.alter_column(
        "medication_items",
        "timing",
        existing_type=mysql.ENUM(
            "EMPTY", "BEFORE", "AFTER", collation="utf8mb4_unicode_ci"
        ),
        comment="복용 시기",
        existing_nullable=False,
    )
    op.alter_column(
        "medication_items",
        "status",
        existing_type=mysql.ENUM("ING", "PAUSE", "END", collation="utf8mb4_unicode_ci"),
        comment="복용 상태",
        existing_nullable=False,
    )
    op.alter_column(
        "medication_items",
        "is_prescription",
        existing_type=mysql.TINYINT(display_width=1),
        comment="처방약 여부(일반 약국약인지, 병원 처방약인지)",
        existing_nullable=False,
    )
    op.alter_column(
        "medication_items",
        "created_at",
        existing_type=mysql.DATETIME(),
        comment="만들어진 날짜",
        existing_nullable=False,
        existing_server_default=sa.text("(now())"),
    )
    op.alter_column(
        "medication_schedules",
        "medication_schedule_seq",
        existing_type=mysql.INTEGER(),
        comment="약 스케줄 기본키",
        existing_nullable=False,
        autoincrement=True,
    )
    op.alter_column(
        "medication_schedules",
        "medication_item_seq",
        existing_type=mysql.INTEGER(),
        comment="약 기본키(외래키)",
        existing_nullable=False,
    )
    op.alter_column(
        "medication_schedules",
        "scheduled_time",
        existing_type=mysql.TIME(),
        comment="복용 시간",
        existing_nullable=False,
    )
    op.alter_column(
        "users",
        "user_seq",
        existing_type=mysql.INTEGER(),
        comment="유저 기본키",
        existing_nullable=False,
        autoincrement=True,
    )
    op.alter_column(
        "users",
        "user_id",
        existing_type=mysql.VARCHAR(collation="utf8mb4_unicode_ci", length=50),
        comment="유저 아이디",
        existing_nullable=False,
    )
    op.alter_column(
        "users",
        "user_password",
        existing_type=mysql.VARCHAR(collation="utf8mb4_unicode_ci", length=255),
        comment="유저 비밀번호",
        existing_nullable=False,
    )
    op.alter_column(
        "users",
        "user_name",
        existing_type=mysql.VARCHAR(collation="utf8mb4_unicode_ci", length=50),
        comment="유저 이름",
        existing_nullable=False,
    )
    op.alter_column(
        "users",
        "is_demo",
        existing_type=mysql.TINYINT(display_width=1),
        comment="데모용인지 아닌지",
        existing_nullable=False,
    )
    op.alter_column(
        "users",
        "created_at",
        existing_type=mysql.DATETIME(),
        comment="만들어진 날짜",
        existing_nullable=False,
        existing_server_default=sa.text("(now())"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        "users",
        "created_at",
        existing_type=mysql.DATETIME(),
        comment=None,
        existing_comment="만들어진 날짜",
        existing_nullable=False,
        existing_server_default=sa.text("(now())"),
    )
    op.alter_column(
        "users",
        "is_demo",
        existing_type=mysql.TINYINT(display_width=1),
        comment=None,
        existing_comment="데모용인지 아닌지",
        existing_nullable=False,
    )
    op.alter_column(
        "users",
        "user_name",
        existing_type=mysql.VARCHAR(collation="utf8mb4_unicode_ci", length=50),
        comment=None,
        existing_comment="유저 이름",
        existing_nullable=False,
    )
    op.alter_column(
        "users",
        "user_password",
        existing_type=mysql.VARCHAR(collation="utf8mb4_unicode_ci", length=255),
        comment=None,
        existing_comment="유저 비밀번호",
        existing_nullable=False,
    )
    op.alter_column(
        "users",
        "user_id",
        existing_type=mysql.VARCHAR(collation="utf8mb4_unicode_ci", length=50),
        comment=None,
        existing_comment="유저 아이디",
        existing_nullable=False,
    )
    op.alter_column(
        "users",
        "user_seq",
        existing_type=mysql.INTEGER(),
        comment=None,
        existing_comment="유저 기본키",
        existing_nullable=False,
        autoincrement=True,
    )
    op.alter_column(
        "medication_schedules",
        "scheduled_time",
        existing_type=mysql.TIME(),
        comment=None,
        existing_comment="복용 시간",
        existing_nullable=False,
    )
    op.alter_column(
        "medication_schedules",
        "medication_item_seq",
        existing_type=mysql.INTEGER(),
        comment=None,
        existing_comment="약 기본키(외래키)",
        existing_nullable=False,
    )
    op.alter_column(
        "medication_schedules",
        "medication_schedule_seq",
        existing_type=mysql.INTEGER(),
        comment=None,
        existing_comment="약 스케줄 기본키",
        existing_nullable=False,
        autoincrement=True,
    )
    op.alter_column(
        "medication_items",
        "created_at",
        existing_type=mysql.DATETIME(),
        comment=None,
        existing_comment="만들어진 날짜",
        existing_nullable=False,
        existing_server_default=sa.text("(now())"),
    )
    op.alter_column(
        "medication_items",
        "is_prescription",
        existing_type=mysql.TINYINT(display_width=1),
        comment=None,
        existing_comment="처방약 여부(일반 약국약인지, 병원 처방약인지)",
        existing_nullable=False,
    )
    op.alter_column(
        "medication_items",
        "status",
        existing_type=mysql.ENUM("ING", "PAUSE", "END", collation="utf8mb4_unicode_ci"),
        comment=None,
        existing_comment="복용 상태",
        existing_nullable=False,
    )
    op.alter_column(
        "medication_items",
        "timing",
        existing_type=mysql.ENUM(
            "EMPTY", "BEFORE", "AFTER", collation="utf8mb4_unicode_ci"
        ),
        comment=None,
        existing_comment="복용 시기",
        existing_nullable=False,
    )
    op.alter_column(
        "medication_items",
        "photo_path",
        existing_type=mysql.VARCHAR(collation="utf8mb4_unicode_ci", length=255),
        comment=None,
        existing_comment="사진 경로",
        existing_nullable=True,
    )
    op.alter_column(
        "medication_items",
        "description",
        existing_type=mysql.VARCHAR(collation="utf8mb4_unicode_ci", length=500),
        comment=None,
        existing_comment="설명",
        existing_nullable=True,
    )
    op.alter_column(
        "medication_items",
        "nutrition_info",
        existing_type=mysql.VARCHAR(collation="utf8mb4_unicode_ci", length=500),
        comment=None,
        existing_comment="함량/영양정보",
        existing_nullable=True,
    )
    op.alter_column(
        "medication_items",
        "company_name",
        existing_type=mysql.VARCHAR(collation="utf8mb4_unicode_ci", length=50),
        comment=None,
        existing_comment="회사명",
        existing_nullable=True,
    )
    op.alter_column(
        "medication_items",
        "product_name",
        existing_type=mysql.VARCHAR(collation="utf8mb4_unicode_ci", length=50),
        comment=None,
        existing_comment="제품명",
        existing_nullable=True,
    )
    op.alter_column(
        "medication_items",
        "name",
        existing_type=mysql.VARCHAR(collation="utf8mb4_unicode_ci", length=50),
        comment=None,
        existing_comment="명칭(이름)",
        existing_nullable=False,
    )
    op.alter_column(
        "medication_items",
        "medication_item_seq",
        existing_type=mysql.INTEGER(),
        comment=None,
        existing_comment="약 기본키",
        existing_nullable=False,
        autoincrement=True,
    )
