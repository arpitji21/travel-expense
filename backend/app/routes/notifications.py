from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

from app.extensions import db
from app.models import Notification
from app.routes.helpers import require_current_user

notifications_bp = Blueprint("notifications", __name__)


@notifications_bp.get("")
@jwt_required()
def list_notifications():
    user, error = require_current_user()

    if error:
        return error

    items = (
        Notification.query.filter_by(user_id=user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )
    unread = Notification.query.filter_by(user_id=user.id, read=False).count()
    return jsonify({"notifications": [item.to_dict() for item in items], "unread": unread})


@notifications_bp.post("/read")
@jwt_required()
def mark_all_read():
    user, error = require_current_user()

    if error:
        return error

    Notification.query.filter_by(user_id=user.id, read=False).update({"read": True})
    db.session.commit()
    return jsonify({"message": "All notifications marked read."})
