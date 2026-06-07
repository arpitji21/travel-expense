from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from app.extensions import db
from app.models import Demand
from app.routes.helpers import (
    get_demand_for_user,
    json_body,
    require_current_user,
    validation_error,
)

demands_bp = Blueprint("demands", __name__)

VALID_STATUSES = {"open", "fulfilled", "cancelled"}


@demands_bp.get("/route")
@jwt_required()
def todays_route():
    """Today's route: hospitals with open demands, grouped into one stop each."""
    user, error = require_current_user()

    if error:
        return error

    query = Demand.query.filter_by(status="open")

    if user.role == "finance":
        user_id = request.args.get("userId", type=int)
        if user_id:
            query = query.filter_by(user_id=user_id)
    else:
        query = query.filter_by(user_id=user.id)

    demands = query.order_by(Demand.hospital_name.asc(), Demand.created_at.asc()).all()

    stops = {}
    order = []
    for demand in demands:
        key = (demand.hospital_name, demand.hospital_address or "")
        if key not in stops:
            stops[key] = {
                "hospitalName": demand.hospital_name,
                "hospitalAddress": demand.hospital_address,
                "items": [],
            }
            order.append(key)
        stops[key]["items"].append(
            {"product": demand.product, "quantity": demand.quantity, "note": demand.note}
        )

    return jsonify({"route": [stops[key] for key in order]})


@demands_bp.get("")
@jwt_required()
def list_demands():
    user, error = require_current_user()

    if error:
        return error

    query = Demand.query

    if user.role == "finance":
        # Finance can filter the demand list by a particular salesperson.
        user_id = request.args.get("userId", type=int)
        if user_id:
            query = query.filter_by(user_id=user_id)
    else:
        query = query.filter_by(user_id=user.id)

    demands = query.order_by(Demand.created_at.desc()).all()
    return jsonify({"demands": [demand.to_dict() for demand in demands]})


@demands_bp.post("")
@jwt_required()
def create_demand():
    user, error = require_current_user()

    if error:
        return error

    data = json_body()
    hospital_name = (data.get("hospitalName") or "").strip()
    hospital_address = (data.get("hospitalAddress") or "").strip() or None
    product = (data.get("product") or "").strip()
    note = (data.get("note") or "").strip() or None
    quantity = data.get("quantity", 1)

    if not hospital_name:
        return validation_error("hospitalName is required.")

    if not product:
        return validation_error("product is required.")

    try:
        quantity = int(quantity)
    except (TypeError, ValueError):
        return validation_error("quantity must be a whole number.")

    if quantity < 1:
        return validation_error("quantity must be at least 1.")

    demand = Demand(
        user_id=user.id,
        hospital_name=hospital_name,
        hospital_address=hospital_address,
        product=product,
        quantity=quantity,
        note=note,
    )

    db.session.add(demand)
    db.session.commit()

    return jsonify({"demand": demand.to_dict()}), 201


@demands_bp.get("/<int:demand_id>")
@jwt_required()
def get_demand(demand_id):
    user, error = require_current_user()

    if error:
        return error

    demand = get_demand_for_user(demand_id, user)

    if not demand:
        return jsonify({"message": "Demand not found."}), 404

    return jsonify({"demand": demand.to_dict()})


@demands_bp.put("/<int:demand_id>")
@jwt_required()
def update_demand(demand_id):
    user, error = require_current_user()

    if error:
        return error

    demand = get_demand_for_user(demand_id, user)

    if not demand:
        return jsonify({"message": "Demand not found."}), 404

    data = json_body()

    if "hospitalName" in data:
        hospital_name = (data.get("hospitalName") or "").strip()
        if not hospital_name:
            return validation_error("hospitalName cannot be empty.")
        demand.hospital_name = hospital_name

    if "hospitalAddress" in data:
        demand.hospital_address = (data.get("hospitalAddress") or "").strip() or None

    if "product" in data:
        product = (data.get("product") or "").strip()
        if not product:
            return validation_error("product cannot be empty.")
        demand.product = product

    if "quantity" in data:
        try:
            quantity = int(data.get("quantity"))
        except (TypeError, ValueError):
            return validation_error("quantity must be a whole number.")
        if quantity < 1:
            return validation_error("quantity must be at least 1.")
        demand.quantity = quantity

    if "note" in data:
        demand.note = (data.get("note") or "").strip() or None

    if "status" in data:
        status = (data.get("status") or "").strip().lower()
        if status not in VALID_STATUSES:
            return validation_error("status must be open, fulfilled, or cancelled.")
        demand.status = status

    db.session.commit()

    return jsonify({"demand": demand.to_dict()})


@demands_bp.delete("/<int:demand_id>")
@jwt_required()
def delete_demand(demand_id):
    user, error = require_current_user()

    if error:
        return error

    demand = get_demand_for_user(demand_id, user)

    if not demand:
        return jsonify({"message": "Demand not found."}), 404

    db.session.delete(demand)
    db.session.commit()

    return jsonify({"message": "Demand deleted."})
