from datetime import datetime, timezone

from app.extensions import db


class Demand(db.Model):
    __tablename__ = "demands"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    hospital_name = db.Column(db.String(255), nullable=False)
    hospital_address = db.Column(db.String(500), nullable=True)
    product = db.Column(db.String(255), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    note = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), nullable=False, default="open", index=True)
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

    user = db.relationship("User", back_populates="demands")

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "salespersonEmail": self.user.email if self.user else None,
            "hospitalName": self.hospital_name,
            "hospitalAddress": self.hospital_address,
            "product": self.product,
            "quantity": self.quantity,
            "note": self.note,
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
