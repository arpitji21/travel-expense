from datetime import datetime, timezone

from app.extensions import db


class DistributorStock(db.Model):
    """Inventory owned by a distributor."""

    __tablename__ = "distributor_stocks"

    id = db.Column(db.Integer, primary_key=True)
    distributor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    product_name = db.Column(db.String(255), nullable=False)
    sku = db.Column(db.String(100), nullable=True)
    serial_number = db.Column(db.String(255), nullable=False)
    quantity_available = db.Column(db.Integer, nullable=False, default=0)
    unit_price = db.Column(db.Numeric(12, 2), nullable=True)
    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    distributor = db.relationship("User", back_populates="distributor_stocks")
    allocations = db.relationship("StockAllocation", back_populates="stock", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "distributorId": self.distributor_id,
            "distributorEmail": self.distributor.email if self.distributor else None,
            "productName": self.product_name,
            "sku": self.sku,
            "serialNumber": self.serial_number,
            "quantityAvailable": self.quantity_available,
            "unitPrice": float(self.unit_price) if self.unit_price else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }


class StockAllocation(db.Model):
    """Finance allocating stock from a distributor to a salesperson."""

    __tablename__ = "stock_allocations"

    id = db.Column(db.Integer, primary_key=True)
    stock_id = db.Column(db.Integer, db.ForeignKey("distributor_stocks.id"), nullable=False, index=True)
    salesperson_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    finance_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    quantity_allocated = db.Column(db.Integer, nullable=False)
    remarks = db.Column(db.Text, nullable=True)
    allocated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    stock = db.relationship("DistributorStock", back_populates="allocations")
    salesperson = db.relationship("User", foreign_keys=[salesperson_id], back_populates="received_allocations")
    finance_user = db.relationship("User", foreign_keys=[finance_user_id])

    def to_dict(self):
        return {
            "id": self.id,
            "stockId": self.stock_id,
            "productName": self.stock.product_name if self.stock else None,
            "sku": self.stock.sku if self.stock else None,
            "serialNumber": self.stock.serial_number if self.stock else None,
            "salespersonId": self.salesperson_id,
            "salespersonEmail": self.salesperson.email if self.salesperson else None,
            "financeUserId": self.finance_user_id,
            "financeUserEmail": self.finance_user.email if self.finance_user else None,
            "distributorEmail": self.stock.distributor.email if self.stock and self.stock.distributor else None,
            "quantityAllocated": self.quantity_allocated,
            "remarks": self.remarks,
            "allocatedAt": self.allocated_at.isoformat() if self.allocated_at else None,
        }
