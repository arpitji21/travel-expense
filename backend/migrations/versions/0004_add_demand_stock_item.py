"""link demands to a stock item (for stock draw-down)

Revision ID: 0004_add_demand_stock_item
Revises: 0003_add_stock_items
Create Date: 2026-06-08 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "0004_add_demand_stock_item"
down_revision = "0003_add_stock_items"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("demands") as batch_op:
        batch_op.add_column(sa.Column("stock_item_id", sa.Integer(), nullable=True))
        batch_op.create_index("ix_demands_stock_item_id", ["stock_item_id"], unique=False)
        batch_op.create_foreign_key(
            "fk_demands_stock_item_id", "stock_items", ["stock_item_id"], ["id"]
        )


def downgrade():
    with op.batch_alter_table("demands") as batch_op:
        batch_op.drop_constraint("fk_demands_stock_item_id", type_="foreignkey")
        batch_op.drop_index("ix_demands_stock_item_id")
        batch_op.drop_column("stock_item_id")
