"""add notifications table

Revision ID: 0007_add_notifications
Revises: 0006_add_schedule_demand_flag
Create Date: 2026-06-08 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "0007_add_notifications"
down_revision = "0006_add_schedule_demand_flag"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "notifications",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("message", sa.String(length=500), nullable=False),
        sa.Column("category", sa.String(length=50), nullable=True),
        sa.Column("read", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_notifications_user_id", "notifications", ["user_id"], unique=False)
    op.create_index("ix_notifications_created_at", "notifications", ["created_at"], unique=False)


def downgrade():
    op.drop_index("ix_notifications_created_at", table_name="notifications")
    op.drop_index("ix_notifications_user_id", table_name="notifications")
    op.drop_table("notifications")
