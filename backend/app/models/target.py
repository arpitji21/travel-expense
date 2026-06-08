from datetime import datetime, timezone

from app.extensions import db


class Target(db.Model):
    """A salesperson's monthly goals (visits completed + demands booked)."""

    __tablename__ = "targets"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    # Month the target applies to, as 'YYYY-MM'.
    period = db.Column(db.String(7), nullable=False, index=True)
    visits_target = db.Column(db.Integer, nullable=False, default=0)
    demands_target = db.Column(db.Integer, nullable=False, default=0)
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

    user = db.relationship("User")

    __table_args__ = (db.UniqueConstraint("user_id", "period", name="uq_target_user_period"),)

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "salespersonEmail": self.user.email if self.user else None,
            "period": self.period,
            "visitsTarget": self.visits_target,
            "demandsTarget": self.demands_target,
        }
