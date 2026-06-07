from datetime import date, datetime, timezone
from decimal import Decimal, InvalidOperation

from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity

from app.models import Claim, User


def current_user():
    user_id = get_jwt_identity()

    if not user_id:
        return None

    return User.query.get(int(user_id))


def require_current_user():
    user = current_user()

    if not user:
        return None, (jsonify({"message": "User not found."}), 404)

    return user, None


def require_finance_user():
    user, error = require_current_user()

    if error:
        return None, error

    if user.role != "finance":
        return None, (jsonify({"message": "Finance role required."}), 403)

    return user, None


def json_body():
    return request.get_json(silent=True) or {}


def parse_date(value, field_name, required=False):
    if not value:
        if required:
            raise ValueError(f"{field_name} is required.")
        return None

    try:
        return date.fromisoformat(value)
    except ValueError as exc:
        raise ValueError(f"{field_name} must be an ISO date.") from exc


def parse_decimal(value, field_name, required=False):
    if value in (None, ""):
        if required:
            raise ValueError(f"{field_name} is required.")
        return None

    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError) as exc:
        raise ValueError(f"{field_name} must be a number.") from exc


def validation_error(message):
    return jsonify({"message": message}), 400


def get_claim_for_user(claim_id, user):
    if not claim_id or not user:
        return None

    claim = Claim.query.get(claim_id)

    if not claim:
        return None

    if user.role != "finance" and claim.user_id != user.id:
        return None

    return claim


def apply_claim_total(claim):
    claim.total_amount = sum((expense.amount for expense in claim.expenses), Decimal("0.00"))


def utc_now():
    return datetime.now(timezone.utc)
