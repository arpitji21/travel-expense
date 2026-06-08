"""add stock_items table (company-wide stock)

Revision ID: 0003_add_stock_items
Revises: 0002_add_schedule_entries
Create Date: 2026-06-08 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "0003_add_stock_items"
down_revision = "0002_add_schedule_entries"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "stock_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("supplier", sa.String(length=255), nullable=True),
        sa.Column("product", sa.String(length=255), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("unit", sa.String(length=50), nullable=True),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade():
    op.drop_table("stock_items")
