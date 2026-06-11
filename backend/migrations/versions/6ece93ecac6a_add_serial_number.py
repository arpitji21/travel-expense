"""add serial number

Revision ID: 6ece93ecac6a
Revises: 4f63b6b0487e
Create Date: 2026-06-11 14:13:52.499921
"""
from alembic import op
import sqlalchemy as sa


revision = '6ece93ecac6a'
down_revision = '4f63b6b0487e'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('distributor_stocks', sa.Column('serial_number', sa.String(length=255), nullable=True))
    op.add_column('stock_items', sa.Column('serial_number', sa.String(length=255), nullable=True))


def downgrade():
    op.drop_column('stock_items', 'serial_number')
    op.drop_column('distributor_stocks', 'serial_number')
