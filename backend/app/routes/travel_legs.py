from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

from app.extensions import db
from app.models import Claim, TravelLeg
from app.routes.helpers import (
    get_claim_for_user,
    json_body,
    parse_date,
    require_current_user,
    validation_error,
)

travel_legs_bp = Blueprint("travel_legs", __name__)


@travel_legs_bp.get("")
@jwt_required()
def list_travel_legs():
    user, error = require_current_user()

    if error:
        return error

    query = TravelLeg.query.join(TravelLeg.claim)
    if user.role != "finance":
        query = query.filter(Claim.user_id == user.id)

    travel_legs = query.order_by(TravelLeg.departure_date.desc()).all()
    return jsonify({"travelLegs": [travel_leg.to_dict() for travel_leg in travel_legs]})


@travel_legs_bp.get("/<int:travel_leg_id>")
@jwt_required()
def get_travel_leg(travel_leg_id):
    user, error = require_current_user()

    if error:
        return error

    travel_leg = TravelLeg.query.get(travel_leg_id)

    if not travel_leg or not get_claim_for_user(travel_leg.claim_id, user):
        return jsonify({"message": "Travel leg not found."}), 404

    return jsonify({"travelLeg": travel_leg.to_dict()})


@travel_legs_bp.post("")
@jwt_required()
def create_travel_leg():
    user, error = require_current_user()

    if error:
        return error

    data = json_body()
    claim = get_claim_for_user(data.get("claimId"), user)

    if not claim:
        return jsonify({"message": "Claim not found."}), 404

    if claim.status != "draft":
        return validation_error("Travel legs can only be added to draft claims.")

    try:
        departure_date = parse_date(data.get("departureDate"), "departureDate", required=True)
        return_date = parse_date(data.get("returnDate"), "returnDate")
    except ValueError as exc:
        return validation_error(str(exc))

    origin = (data.get("origin") or "").strip()
    destination = (data.get("destination") or "").strip()
    transport_mode = (data.get("transportMode") or "").strip()

    if not origin or not destination or not transport_mode:
        return validation_error("origin, destination, and transportMode are required.")

    travel_leg = TravelLeg(
        claim_id=claim.id,
        origin=origin,
        destination=destination,
        transport_mode=transport_mode,
        departure_date=departure_date,
        return_date=return_date,
    )

    db.session.add(travel_leg)
    db.session.commit()

    return jsonify({"travelLeg": travel_leg.to_dict()}), 201


@travel_legs_bp.put("/<int:travel_leg_id>")
@jwt_required()
def update_travel_leg(travel_leg_id):
    user, error = require_current_user()

    if error:
        return error

    travel_leg = TravelLeg.query.get(travel_leg_id)

    claim = get_claim_for_user(travel_leg.claim_id, user) if travel_leg else None

    if not travel_leg or not claim:
        return jsonify({"message": "Travel leg not found."}), 404

    if claim.status != "draft":
        return validation_error("Travel legs can only be updated on draft claims.")

    data = json_body()

    for field, attr in [
        ("origin", "origin"),
        ("destination", "destination"),
        ("transportMode", "transport_mode"),
    ]:
        if field in data:
            value = (data.get(field) or "").strip()
            if not value:
                return validation_error(f"{field} cannot be empty.")
            setattr(travel_leg, attr, value)

    try:
        if "departureDate" in data:
            travel_leg.departure_date = parse_date(
                data.get("departureDate"),
                "departureDate",
                required=True,
            )
        if "returnDate" in data:
            travel_leg.return_date = parse_date(data.get("returnDate"), "returnDate")
    except ValueError as exc:
        return validation_error(str(exc))

    db.session.commit()

    return jsonify({"travelLeg": travel_leg.to_dict()})


@travel_legs_bp.delete("/<int:travel_leg_id>")
@jwt_required()
def delete_travel_leg(travel_leg_id):
    user, error = require_current_user()

    if error:
        return error

    travel_leg = TravelLeg.query.get(travel_leg_id)

    claim = get_claim_for_user(travel_leg.claim_id, user) if travel_leg else None

    if not travel_leg or not claim:
        return jsonify({"message": "Travel leg not found."}), 404

    if claim.status != "draft":
        return validation_error("Travel legs can only be deleted from draft claims.")

    db.session.delete(travel_leg)
    db.session.commit()

    return jsonify({"message": "Travel leg deleted."})
