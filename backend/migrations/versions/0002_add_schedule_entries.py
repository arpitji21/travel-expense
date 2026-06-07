"""add schedule_entries table

Revision ID: 0002_add_schedule_entries
Revises: 0001_create_core_tables
Create Date: 2026-06-08 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "0002_add_schedule_entries"
down_revision = "0001_create_core_tables"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "schedule_entries",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("entry_date", sa.Date(), nullable=False),
        sa.Column("entry_time", sa.Time(), nullable=True),
        sa.Column("place", sa.String(length=255), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("done", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_schedule_entries_entry_date", "schedule_entries", ["entry_date"], unique=False)
    op.create_index("ix_schedule_entries_user_id", "schedule_entries", ["user_id"], unique=False)


def downgrade():
    op.drop_index("ix_schedule_entries_user_id", table_name="schedule_entries")
    op.drop_index("ix_schedule_entries_entry_date", table_name="schedule_entries")
    op.drop_table("schedule_entries")
