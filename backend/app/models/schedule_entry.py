from datetime import datetime, timezone

from app.extensions import db


class ScheduleEntry(db.Model):
    __tablename__ = "schedule_entries"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    entry_date = db.Column(db.Date, nullable=False, index=True)
    entry_time = db.Column(db.Time, nullable=True)
    place = db.Column(db.String(255), nullable=False)
    note = db.Column(db.Text, nullable=True)
    done = db.Column(db.Boolean, nullable=False, default=False)
    # Salesperson can flag that this hospital may have demand, for finance to see.
    demand_expected = db.Column(db.Boolean, nullable=False, default=False)
    demand_note = db.Column(db.Text, nullable=True)
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

    user = db.relationship("User", back_populates="schedule_entries")

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "salespersonEmail": self.user.email if self.user else None,
            "entryDate": self.entry_date.isoformat() if self.entry_date else None,
            "entryTime": self.entry_time.strftime("%H:%M") if self.entry_time else None,
            "place": self.place,
            "note": self.note,
            "done": self.done,
            "demandExpected": self.demand_expected,
            "demandNote": self.demand_note,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
