import re
from datetime import date

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from app.extensions import db
from app.models import Demand, ScheduleEntry, Target, User
from app.routes.helpers import (
    json_body,
    require_current_user,
    require_finance_user,
    validation_error,
)

targets_bp = Blueprint("targets", __name__)

PERIOD_RE = re.compile(r"^\d{4}-\d{2}$")


def _period_bounds(period):
    year, month = int(period[:4]), int(period[5:7])
    start = date(year, month, 1)
    end = date(year + 1, 1, 1) if month == 12 else date(year, month + 1, 1)
    return start, end


def _actuals(user_id, period):
    start, end = _period_bounds(period)
    visits_done = ScheduleEntry.query.filter(
        ScheduleEntry.user_id == user_id,
        ScheduleEntry.done.is_(True),
        ScheduleEntry.entry_date >= start,
        ScheduleEntry.entry_date < end,
    ).count()
    demands_booked = Demand.query.filter(
        Demand.user_id == user_id,
        Demand.created_at >= start,
        Demand.created_at < end,
    ).count()
    return visits_done, demands_booked


def _with_actuals(target):
    visits_done, demands_booked = _actuals(target.user_id, target.period)
    data = target.to_dict()
    data["visitsDone"] = visits_done
    data["demandsBooked"] = demands_booked
    return data


@targets_bp.get("")
@jwt_required()
def list_targets():
    user, error = require_current_user()

    if error:
        return error

    query = Target.query

    if user.role == "finance":
        user_id = request.args.get("userId", type=int)
        if user_id:
            query = query.filter_by(user_id=user_id)
    else:
        query = query.filter_by(user_id=user.id)

    period = request.args.get("period")
    if period:
        if not PERIOD_RE.match(period):
            return validation_error("period must be YYYY-MM.")
        query = query.filter_by(period=period)

    targets = query.order_by(Target.period.desc()).all()
    return jsonify({"targets": [_with_actuals(target) for target in targets]})


@targets_bp.post("")
@jwt_required()
def upsert_target():
    # Finance sets salespeople's targets.
    _, error = require_finance_user()

    if error:
        return error

    data = json_body()
    salesperson_id = data.get("userId")
    period = (data.get("period") or "").strip()

    if not salesperson_id:
        return validation_error("userId (salesperson) is required.")

    salesperson = User.query.get(salesperson_id)
    if not salesperson:
        return validation_error("Salesperson not found.")

    if not PERIOD_RE.match(period):
        return validation_error("period must be YYYY-MM.")

    try:
        visits_target = int(data.get("visitsTarget", 0))
        demands_target = int(data.get("demandsTarget", 0))
    except (TypeError, ValueError):
        return validation_error("targets must be whole numbers.")

    if visits_target < 0 or demands_target < 0:
        return validation_error("targets cannot be negative.")

    target = Target.query.filter_by(user_id=salesperson.id, period=period).first()
    if target:
        target.visits_target = visits_target
        target.demands_target = demands_target
    else:
        target = Target(
            user_id=salesperson.id,
            period=period,
            visits_target=visits_target,
            demands_target=demands_target,
        )
        db.session.add(target)

    db.session.commit()
    return jsonify({"target": _with_actuals(target)}), 201


@targets_bp.delete("/<int:target_id>")
@jwt_required()
def delete_target(target_id):
    _, error = require_finance_user()

    if error:
        return error

    target = Target.query.get(target_id)

    if not target:
        return jsonify({"message": "Target not found."}), 404

    db.session.delete(target)
    db.session.commit()
    return jsonify({"message": "Target deleted."})
