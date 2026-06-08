from datetime import datetime, timezone

from app.extensions import db


class Material(db.Model):
    """A marketing / sales material the management (finance) team shares.

    Each material is EITHER an uploaded file (document/image) OR an external
    link (e.g. a Google Drive / YouTube URL) — used for videos and large media
    that don't fit free file storage. Visible to all logged-in users.
    """

    __tablename__ = "materials"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(100), nullable=True)
    # One of these is set:
    file_url = db.Column(db.String(500), nullable=True)
    file_name = db.Column(db.String(255), nullable=True)
    link_url = db.Column(db.String(1000), nullable=True)

    uploaded_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
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

    uploader = db.relationship("User")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "kind": "link" if self.link_url else "file",
            "fileUrl": self.file_url,
            "fileName": self.file_name,
            "linkUrl": self.link_url,
            "uploadedByEmail": self.uploader.email if self.uploader else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
