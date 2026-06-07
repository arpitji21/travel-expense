from datetime import datetime, timezone

from app.extensions import db


class TravelLeg(db.Model):
    __tablename__ = "travel_legs"

    id = db.Column(db.Integer, primary_key=True)
    claim_id = db.Column(
        db.Integer,
        db.ForeignKey("claims.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    origin = db.Column(db.String(255), nullable=False)
    destination = db.Column(db.String(255), nullable=False)
    transport_mode = db.Column(db.String(100), nullable=False)
    departure_date = db.Column(db.Date, nullable=False)
    return_date = db.Column(db.Date, nullable=True)
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

    claim = db.relationship("Claim", back_populates="travel_legs")

    def to_dict(self):
        return {
            "id": self.id,
            "claimId": self.claim_id,
            "origin": self.origin,
            "destination": self.destination,
            "transportMode": self.transport_mode,
            "departureDate": self.departure_date.isoformat()
            if self.departure_date
            else None,
            "returnDate": self.return_date.isoformat() if self.return_date else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
