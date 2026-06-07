from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from app.extensions import db
from app.models import ScheduleEntry
from app.routes.helpers import (
    get_schedule_entry_for_user,
    json_body,
    parse_date,
    parse_time,
    require_current_user,
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
    user, error = require_current_user()

    if error:
        return error

    data = json_body()
    place = (data.get("place") or "").strip()

    if not place:
        return validation_error("place is required.")

    try:
        entry_date = parse_date(data.get("entryDate"), "entryDate", required=True)
        entry_time = parse_time(data.get("entryTime"), "entryTime")
    except ValueError as exc:
        return validation_error(str(exc))

    entry = ScheduleEntry(
        user_id=user.id,
        entry_date=entry_date,
        entry_time=entry_time,
        place=place,
        note=(data.get("note") or "").strip() or None,
        done=bool(data.get("done", False)),
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

    if "place" in data:
        place = (data.get("place") or "").strip()
        if not place:
            return validation_error("place cannot be empty.")
        entry.place = place

    if "note" in data:
        entry.note = (data.get("note") or "").strip() or None

    if "done" in data:
        entry.done = bool(data.get("done"))

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
    user, error = require_current_user()

    if error:
        return error

    entry = get_schedule_entry_for_user(entry_id, user)

    if not entry:
        return jsonify({"message": "Schedule entry not found."}), 404

    db.session.delete(entry)
    db.session.commit()

    return jsonify({"message": "Schedule entry deleted."})
