from datetime import datetime, timezone

from app.extensions import db


class Notification(db.Model):
    """A lightweight in-app notification for a single user."""

    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    message = db.Column(db.String(500), nullable=False)
    category = db.Column(db.String(50), nullable=True)
    read = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        index=True,
    )

    def to_dict(self):
        return {
            "id": self.id,
            "message": self.message,
            "category": self.category,
            "read": self.read,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
