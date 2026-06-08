"""add targets table

Revision ID: 0008_add_targets
Revises: 0007_add_notifications
Create Date: 2026-06-08 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "0008_add_targets"
down_revision = "0007_add_notifications"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "targets",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("period", sa.String(length=7), nullable=False),
        sa.Column("visits_target", sa.Integer(), nullable=False),
        sa.Column("demands_target", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "period", name="uq_target_user_period"),
    )
    op.create_index("ix_targets_user_id", "targets", ["user_id"], unique=False)
    op.create_index("ix_targets_period", "targets", ["period"], unique=False)


def downgrade():
    op.drop_index("ix_targets_period", table_name="targets")
    op.drop_index("ix_targets_user_id", table_name="targets")
    op.drop_table("targets")
