from datetime import date, datetime, time, timezone
from decimal import Decimal, InvalidOperation

from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity

from app.models import Demand, Expense, ScheduleEntry, User


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


def parse_time(value, field_name, required=False):
    if not value:
        if required:
            raise ValueError(f"{field_name} is required.")
        return None

    try:
        return time.fromisoformat(value)
    except ValueError as exc:
        raise ValueError(f"{field_name} must be a time like HH:MM.") from exc


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


def get_demand_for_user(demand_id, user):
    if not demand_id or not user:
        return None

    demand = Demand.query.get(demand_id)

    if not demand:
        return None

    if user.role != "finance" and demand.user_id != user.id:
        return None

    return demand


def get_expense_for_user(expense_id, user):
    if not expense_id or not user:
        return None

    expense = Expense.query.get(expense_id)

    if not expense:
        return None

    if user.role != "finance" and expense.user_id != user.id:
        return None

    return expense


def get_schedule_entry_for_user(entry_id, user):
    if not entry_id or not user:
        return None

    entry = ScheduleEntry.query.get(entry_id)

    if not entry:
        return None

    if user.role != "finance" and entry.user_id != user.id:
        return None

    return entry


def utc_now():
    return datetime.now(timezone.utc)
