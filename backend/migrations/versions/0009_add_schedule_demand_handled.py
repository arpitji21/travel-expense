"""add demand_handled flag to schedule entries

Revision ID: 0009_add_schedule_demand_handled
Revises: 0008_add_targets
Create Date: 2026-06-08 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "0009_add_schedule_demand_handled"
down_revision = "0008_add_targets"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("schedule_entries") as batch_op:
        batch_op.add_column(
            sa.Column("demand_handled", sa.Boolean(), nullable=False, server_default=sa.false())
        )


def downgrade():
    with op.batch_alter_table("schedule_entries") as batch_op:
        batch_op.drop_column("demand_handled")
