"""add expected-demand flag to schedule entries

Revision ID: 0006_add_schedule_demand_flag
Revises: 0005_add_materials
Create Date: 2026-06-08 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "0006_add_schedule_demand_flag"
down_revision = "0005_add_materials"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("schedule_entries") as batch_op:
        batch_op.add_column(
            sa.Column("demand_expected", sa.Boolean(), nullable=False, server_default=sa.false())
        )
        batch_op.add_column(sa.Column("demand_note", sa.Text(), nullable=True))


def downgrade():
    with op.batch_alter_table("schedule_entries") as batch_op:
        batch_op.drop_column("demand_note")
        batch_op.drop_column("demand_expected")
