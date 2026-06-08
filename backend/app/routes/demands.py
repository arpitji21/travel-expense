from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from app.extensions import db
from app.models import Demand, StockItem
from app.routes.helpers import (
    get_demand_for_user,
    json_body,
    require_current_user,
    validation_error,
)

demands_bp = Blueprint("demands", __name__)

VALID_STATUSES = {"open", "fulfilled", "cancelled"}


def _reserved(status, quantity):
    """Units a demand holds out of stock: everything unless it's cancelled."""
    return quantity if status != "cancelled" else 0


def _reconcile_stock(old_sid, old_status, old_qty, new_sid, new_status, new_qty):
    """Adjust company stock as a demand changes.

    A demand "reserves" its quantity from its stock item while it is not
    cancelled. This moves stock between the old and new reservation. Returns an
    error message string if there isn't enough stock (caller should rollback),
    otherwise None.
    """
    old_reserved = _reserved(old_status, old_qty)
    new_reserved = _reserved(new_status, new_qty)

    if old_sid == new_sid:
        if not new_sid:
            return None
        item = StockItem.query.get(new_sid)
        if not item:
            return None  # legacy/free-text demand, no stock to track
        net = new_reserved - old_reserved  # >0 reserve more, <0 release
        if net > 0 and item.quantity < net:
            return f"Only {item.quantity} {item.unit or 'units'} of {item.product} available."
        item.quantity -= net
        return None

    # Stock item changed: release the old, reserve on the new.
    if old_sid:
        old_item = StockItem.query.get(old_sid)
        if old_item:
            old_item.quantity += old_reserved
    if new_sid:
        new_item = StockItem.query.get(new_sid)
        if not new_item:
            return "Selected stock item not found."
        if new_item.quantity < new_reserved:
            return f"Only {new_item.quantity} {new_item.unit or 'units'} of {new_item.product} available."
        new_item.quantity -= new_reserved
    return None


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
    stock_item_id = data.get("stockItemId")

    if not hospital_name:
        return validation_error("hospitalName is required.")

    try:
        quantity = int(quantity)
    except (TypeError, ValueError):
        return validation_error("quantity must be a whole number.")

    if quantity < 1:
        return validation_error("quantity must be at least 1.")

    # A demand can be booked against company stock (preferred) or, for backward
    # compatibility, carry a free-text product with no stock tracking.
    stock_item = None
    if stock_item_id:
        stock_item = StockItem.query.get(stock_item_id)
        if not stock_item:
            return validation_error("Selected stock item not found.")
        if not product:
            product = stock_item.product

    if not product:
        return validation_error("product is required.")

    # Draw the quantity down from stock; fail if not enough is available.
    error_message = _reconcile_stock(None, "cancelled", 0, stock_item_id, "open", quantity)
    if error_message:
        db.session.rollback()
        return validation_error(error_message)

    demand = Demand(
        user_id=user.id,
        hospital_name=hospital_name,
        hospital_address=hospital_address,
        product=product,
        quantity=quantity,
        note=note,
        stock_item_id=stock_item.id if stock_item else None,
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

    # Capture the pre-change reservation so we can reconcile stock afterwards.
    old_sid = demand.stock_item_id
    old_status = demand.status
    old_quantity = demand.quantity

    if "hospitalName" in data:
        hospital_name = (data.get("hospitalName") or "").strip()
        if not hospital_name:
            return validation_error("hospitalName cannot be empty.")
        demand.hospital_name = hospital_name

    if "hospitalAddress" in data:
        demand.hospital_address = (data.get("hospitalAddress") or "").strip() or None

    if "stockItemId" in data:
        new_sid = data.get("stockItemId")
        if new_sid:
            stock_item = StockItem.query.get(new_sid)
            if not stock_item:
                return validation_error("Selected stock item not found.")
            demand.stock_item_id = stock_item.id
            demand.product = stock_item.product
        else:
            demand.stock_item_id = None

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

    # Move stock between the old and new reservation (restores it on cancel,
    # re-reserves on re-open, applies quantity deltas, etc.).
    error_message = _reconcile_stock(
        old_sid, old_status, old_quantity,
        demand.stock_item_id, demand.status, demand.quantity,
    )
    if error_message:
        db.session.rollback()
        return validation_error(error_message)

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

    # Return any still-reserved stock to the company pool before deleting.
    if demand.stock_item_id and demand.status != "cancelled":
        stock_item = StockItem.query.get(demand.stock_item_id)
        if stock_item:
            stock_item.quantity += demand.quantity

    db.session.delete(demand)
    db.session.commit()

    return jsonify({"message": "Demand deleted."})
