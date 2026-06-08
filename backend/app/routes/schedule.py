from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from app.extensions import db
from app.models import ScheduleEntry, User
from app.routes.helpers import (
    get_schedule_entry_for_user,
    json_body,
    parse_date,
    parse_time,
    require_current_user,
    require_finance_user,
    validation_error,
)

schedule_bp = Blueprint("schedule", __name__)


@schedule_bp.get("")
@jwt_required()
def list_schedule():
    user, error = require_current_user()

    if error:
        return error

    query = ScheduleEntry.query

    if user.role == "finance":
        # Management can review a particular salesperson's schedule.
        user_id = request.args.get("userId", type=int)
        if user_id:
            query = query.filter_by(user_id=user_id)
    else:
        query = query.filter_by(user_id=user.id)

    date_filter = request.args.get("date")
    if date_filter:
        try:
            query = query.filter_by(entry_date=parse_date(date_filter, "date", required=True))
        except ValueError as exc:
            return validation_error(str(exc))

    entries = query.order_by(
        ScheduleEntry.entry_date.desc(), ScheduleEntry.entry_time.asc()
    ).all()
    return jsonify({"entries": [entry.to_dict() for entry in entries]})


@schedule_bp.post("")
@jwt_required()
def create_schedule_entry():
    # Finance assigns hospital visits to a salesperson for a day.
    _, error = require_finance_user()

    if error:
        return error

    data = json_body()
    place = (data.get("place") or "").strip()

    if not place:
        return validation_error("place (hospital) is required.")

    salesperson_id = data.get("userId")
    if not salesperson_id:
        return validation_error("userId (salesperson) is required.")

    salesperson = User.query.get(salesperson_id)
    if not salesperson:
        return validation_error("Salesperson not found.")

    try:
        entry_date = parse_date(data.get("entryDate"), "entryDate", required=True)
        entry_time = parse_time(data.get("entryTime"), "entryTime")
    except ValueError as exc:
        return validation_error(str(exc))

    entry = ScheduleEntry(
        user_id=salesperson.id,
        entry_date=entry_date,
        entry_time=entry_time,
        place=place,
        note=(data.get("note") or "").strip() or None,
        done=False,
    )

    db.session.add(entry)
    db.session.commit()

    return jsonify({"entry": entry.to_dict()}), 201


@schedule_bp.get("/<int:entry_id>")
@jwt_required()
def get_schedule_entry(entry_id):
    user, error = require_current_user()

    if error:
        return error

    entry = get_schedule_entry_for_user(entry_id, user)

    if not entry:
        return jsonify({"message": "Schedule entry not found."}), 404

    return jsonify({"entry": entry.to_dict()})


@schedule_bp.put("/<int:entry_id>")
@jwt_required()
def update_schedule_entry(entry_id):
    user, error = require_current_user()

    if error:
        return error

    entry = get_schedule_entry_for_user(entry_id, user)

    if not entry:
        return jsonify({"message": "Schedule entry not found."}), 404

    data = json_body()

    # Both roles: mark the visit done and flag/clear expected demand.
    if "done" in data:
        entry.done = bool(data.get("done"))

    if "demandExpected" in data:
        entry.demand_expected = bool(data.get("demandExpected"))

    if "demandNote" in data:
        entry.demand_note = (data.get("demandNote") or "").strip() or None

    # Only finance owns the assignment itself (hospital, date, time, note).
    if user.role == "finance":
        if "place" in data:
            place = (data.get("place") or "").strip()
            if not place:
                return validation_error("place cannot be empty.")
            entry.place = place

        if "note" in data:
            entry.note = (data.get("note") or "").strip() or None

        try:
            if "entryDate" in data:
                entry.entry_date = parse_date(data.get("entryDate"), "entryDate", required=True)
            if "entryTime" in data:
                entry.entry_time = parse_time(data.get("entryTime"), "entryTime")
        except ValueError as exc:
            return validation_error(str(exc))

    db.session.commit()

    return jsonify({"entry": entry.to_dict()})


@schedule_bp.delete("/<int:entry_id>")
@jwt_required()
def delete_schedule_entry(entry_id):
    # Finance owns assignments, so only finance can remove them.
    _, error = require_finance_user()

    if error:
        return error

    entry = ScheduleEntry.query.get(entry_id)

    if not entry:
        return jsonify({"message": "Schedule entry not found."}), 404

    db.session.delete(entry)
    db.session.commit()

    return jsonify({"message": "Schedule entry deleted."})
