from datetime import datetime, timezone

from app.extensions import db


class Claim(db.Model):
    __tablename__ = "claims"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False)
    purpose = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), nullable=False, default="draft", index=True)
    total_amount = db.Column(db.Numeric(12, 2), nullable=False, default=0)
    currency = db.Column(db.String(3), nullable=False, default="USD")
    submitted_at = db.Column(db.DateTime, nullable=True)
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

    user = db.relationship("User", back_populates="claims")
    travel_legs = db.relationship(
        "TravelLeg",
        back_populates="claim",
        cascade="all, delete-orphan",
        order_by="TravelLeg.departure_date",
    )
    expenses = db.relationship(
        "Expense",
        back_populates="claim",
        cascade="all, delete-orphan",
        order_by="Expense.expense_date",
    )

    def to_dict(self, include_children=False):
        data = {
            "id": self.id,
            "userId": self.user_id,
            "title": self.title,
            "purpose": self.purpose,
            "status": self.status,
            "totalAmount": float(self.total_amount or 0),
            "currency": self.currency,
            "submittedAt": self.submitted_at.isoformat() if self.submitted_at else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }

        if include_children:
            data["travelLegs"] = [leg.to_dict() for leg in self.travel_legs]
            data["expenses"] = [expense.to_dict() for expense in self.expenses]

        return data
