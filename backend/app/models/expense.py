from datetime import datetime, timezone

from app.extensions import db


class Expense(db.Model):
    __tablename__ = "expenses"

    id = db.Column(db.Integer, primary_key=True)
    claim_id = db.Column(
        db.Integer,
        db.ForeignKey("claims.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    category = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    currency = db.Column(db.String(3), nullable=False, default="USD")
    expense_date = db.Column(db.Date, nullable=False)
    receipt_url = db.Column(db.String(500), nullable=True)
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

    claim = db.relationship("Claim", back_populates="expenses")

    def to_dict(self):
        return {
            "id": self.id,
            "claimId": self.claim_id,
            "category": self.category,
            "description": self.description,
            "amount": float(self.amount or 0),
            "currency": self.currency,
            "expenseDate": self.expense_date.isoformat() if self.expense_date else None,
            "receiptUrl": self.receipt_url,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
