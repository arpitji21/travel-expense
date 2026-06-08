"""In-app notifications + small helpers for finance recipients.

Pairs with app/email_utils.py: routes typically push an in-app notification
(shown in the bell) and, for some events, also send an email.
"""

from app.extensions import db
from app.models import Notification, User


def push(user_id, message, category=None):
    """Create one in-app notification (commits)."""
    if not user_id:
        return
    db.session.add(Notification(user_id=user_id, message=message, category=category))
    db.session.commit()


def push_many(user_ids, message, category=None):
    """Create the same notification for several users (commits once)."""
    created = False
    for user_id in user_ids:
        if user_id:
            db.session.add(Notification(user_id=user_id, message=message, category=category))
            created = True
    if created:
        db.session.commit()


def finance_users():
    return User.query.filter_by(role="finance").all()


def finance_user_ids():
    return [user.id for user in finance_users()]


def finance_emails():
    return [user.email for user in finance_users() if user.email]
