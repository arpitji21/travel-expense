from datetime import datetime, timezone

from app.extensions import db


class StockItem(db.Model):
    """Company-wide stock on hand, tracked per supplier/vendor + product.

    ``quantity`` is the amount currently available. Finance manages the stock;
    all salespeople can view it. Generating a demand draws down the available
    quantity; cancelling a demand restores it (see app/routes/demands.py).
    """

    __tablename__ = "stock_items"

    id = db.Column(db.Integer, primary_key=True)
    supplier = db.Column(db.String(255), nullable=True)
    product = db.Column(db.String(255), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=0)
    unit = db.Column(db.String(50), nullable=True)
    note = db.Column(db.Text, nullable=True)
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

    demands = db.relationship("Demand", back_populates="stock_item")

    def to_dict(self):
        return {
            "id": self.id,
            "supplier": self.supplier,
            "product": self.product,
            "quantity": self.quantity,
            "unit": self.unit,
            "note": self.note,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
