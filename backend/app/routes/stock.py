from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from app.extensions import db
from app.models import StockItem
from app.routes.helpers import (
    json_body,
    require_current_user,
    require_finance_user,
    validation_error,
)

stock_bp = Blueprint("stock", __name__)


def _parse_quantity(value):
    try:
        quantity = int(value)
    except (TypeError, ValueError) as exc:
        raise ValueError("quantity must be a whole number.") from exc

    if quantity < 0:
        raise ValueError("quantity cannot be negative.")

    return quantity


@stock_bp.get("")
@jwt_required()
def list_stock():
    # Company stock is visible to everyone (salespeople and finance).
    user, error = require_current_user()

    if error:
        return error

    query = StockItem.query

    supplier = (request.args.get("supplier") or "").strip()
    if supplier:
        query = query.filter(StockItem.supplier.ilike(f"%{supplier}%"))

    items = query.order_by(StockItem.supplier.asc(), StockItem.product.asc()).all()
    return jsonify({"stock": [item.to_dict() for item in items]})


@stock_bp.get("/<int:stock_id>")
@jwt_required()
def get_stock(stock_id):
    user, error = require_current_user()

    if error:
        return error

    item = StockItem.query.get(stock_id)

    if not item:
        return jsonify({"message": "Stock item not found."}), 404

    return jsonify({"stock": item.to_dict()})


@stock_bp.post("")
@jwt_required()
def create_stock():
    # Stock is managed by finance.
    _, error = require_finance_user()

    if error:
        return error

    data = json_body()

    supplier = (data.get("supplier") or "").strip() or None
    product = (data.get("product") or "").strip()
    unit = (data.get("unit") or "").strip() or None
    note = (data.get("note") or "").strip() or None

    if not product:
        return validation_error("product is required.")

    try:
        quantity = _parse_quantity(data.get("quantity", 0))
    except ValueError as exc:
        return validation_error(str(exc))

    item = StockItem(
        supplier=supplier,
        product=product,
        quantity=quantity,
        unit=unit,
        note=note,
    )

    db.session.add(item)
    db.session.commit()

    return jsonify({"stock": item.to_dict()}), 201


@stock_bp.put("/<int:stock_id>")
@jwt_required()
def update_stock(stock_id):
    _, error = require_finance_user()

    if error:
        return error

    item = StockItem.query.get(stock_id)

    if not item:
        return jsonify({"message": "Stock item not found."}), 404

    data = json_body()

    if "supplier" in data:
        item.supplier = (data.get("supplier") or "").strip() or None

    if "product" in data:
        product = (data.get("product") or "").strip()
        if not product:
            return validation_error("product cannot be empty.")
        item.product = product

    if "quantity" in data:
        try:
            item.quantity = _parse_quantity(data.get("quantity"))
        except ValueError as exc:
            return validation_error(str(exc))

    if "unit" in data:
        item.unit = (data.get("unit") or "").strip() or None

    if "note" in data:
        item.note = (data.get("note") or "").strip() or None

    db.session.commit()

    return jsonify({"stock": item.to_dict()})


@stock_bp.delete("/<int:stock_id>")
@jwt_required()
def delete_stock(stock_id):
    _, error = require_finance_user()

    if error:
        return error

    item = StockItem.query.get(stock_id)

    if not item:
        return jsonify({"message": "Stock item not found."}), 404

    db.session.delete(item)
    db.session.commit()

    return jsonify({"message": "Stock item deleted."})
