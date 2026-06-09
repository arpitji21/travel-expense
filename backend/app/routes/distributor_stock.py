from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.extensions import db
from app.models import DistributorStock, StockAllocation, User
from app.notifications import push
from app.routes.helpers import (
    json_body,
    parse_decimal,
    require_current_user,
    require_finance_user,
    validation_error,
)

distributor_stock_bp = Blueprint("distributor_stock", __name__)


@distributor_stock_bp.get("")
@jwt_required()
def list_distributor_stock():
    user, error = require_current_user()
    if error:
        return error

    query = DistributorStock.query

    # Distributors see only their own stock
    if user.role == "distributor":
        query = query.filter_by(distributor_id=user.id)
    # Finance and Sales see everything (Finance needs it for allocation, Sales for viewing assigned)

    # Filtering by distributor (for Finance)
    distributor_id = request.args.get("distributorId", type=int)
    if distributor_id:
        query = query.filter_by(distributor_id=distributor_id)

    # Search by product name or SKU
    search = request.args.get("search")
    if search:
        query = query.filter(
            (DistributorStock.product_name.ilike(f"%{search}%")) |
            (DistributorStock.sku.ilike(f"%{search}%"))
        )

    # Low stock filter
    if request.args.get("lowStock") == "true":
        query = query.filter(DistributorStock.quantity_available < 10)

    stocks = query.order_by(DistributorStock.product_name.asc()).all()
    return jsonify({"stocks": [s.to_dict() for s in stocks]})


@distributor_stock_bp.post("")
@jwt_required()
def create_distributor_stock():
    user, error = require_current_user()
    if error:
        return error

    if user.role != "distributor":
        return jsonify({"message": "Only distributors can manage their own stock."}), 403

    data = json_body()
    product_name = (data.get("productName") or "").strip()
    if not product_name:
        return validation_error("productName is required.")

    sku = (data.get("sku") or "").strip() or None
    quantity = int(data.get("quantityAvailable") or 0)
    unit_price = parse_decimal(data.get("unitPrice"), "unitPrice")

    stock = DistributorStock(
        distributor_id=user.id,
        product_name=product_name,
        sku=sku,
        quantity_available=quantity,
        unit_price=unit_price,
    )

    db.session.add(stock)
    db.session.commit()

    return jsonify({"stock": stock.to_dict()}), 201


@distributor_stock_bp.put("/<int:stock_id>")
@jwt_required()
def update_distributor_stock(stock_id):
    user, error = require_current_user()
    if error:
        return error

    stock = DistributorStock.query.get(stock_id)
    if not stock:
        return jsonify({"message": "Stock item not found."}), 404

    if user.role != "distributor" or stock.distributor_id != user.id:
        return jsonify({"message": "Permission denied."}), 403

    data = json_body()
    if "productName" in data:
        stock.product_name = data["productName"].strip() or stock.product_name
    if "sku" in data:
        stock.sku = data["sku"].strip() or None
    if "quantityAvailable" in data:
        stock.quantity_available = int(data["quantityAvailable"])
    if "unitPrice" in data:
        stock.unit_price = parse_decimal(data["unitPrice"], "unitPrice")

    db.session.commit()
    return jsonify({"stock": stock.to_dict()})


@distributor_stock_bp.delete("/<int:stock_id>")
@jwt_required()
def delete_distributor_stock(stock_id):
    user, error = require_current_user()
    if error:
        return error

    stock = DistributorStock.query.get(stock_id)
    if not stock:
        return jsonify({"message": "Stock item not found."}), 404

    if user.role != "distributor" or stock.distributor_id != user.id:
        return jsonify({"message": "Permission denied."}), 403

    db.session.delete(stock)
    db.session.commit()
    return jsonify({"message": "Stock item deleted."})


# --- Allocation Routes ---

@distributor_stock_bp.get("/allocations")
@jwt_required()
def list_stock_allocations():
    user, error = require_current_user()
    if error:
        return error

    query = StockAllocation.query.join(DistributorStock)

    if user.role == "distributor":
        query = query.filter(DistributorStock.distributor_id == user.id)
    elif user.role == "sales":
        query = query.filter(StockAllocation.salesperson_id == user.id)
    # Finance sees everything

    allocations = query.order_by(StockAllocation.allocated_at.desc()).all()
    return jsonify({"allocations": [a.to_dict() for a in allocations]})


@distributor_stock_bp.post("/allocate")
@jwt_required()
def allocate_stock():
    finance, error = require_finance_user()
    if error:
        return error

    data = json_body()
    stock_id = data.get("stockId")
    salesperson_id = data.get("salespersonId")
    quantity = int(data.get("quantityAllocated") or 0)
    remarks = (data.get("remarks") or "").strip() or None

    if not stock_id or not salesperson_id or quantity <= 0:
        return validation_error("stockId, salespersonId, and a positive quantity are required.")

    stock = DistributorStock.query.get(stock_id)
    if not stock:
        return validation_error("Stock item not found.")

    if quantity > stock.quantity_available:
        return validation_error(f"Cannot allocate more than available ({stock.quantity_available}).")

    salesperson = User.query.get(salesperson_id)
    if not salesperson or salesperson.role != "sales":
        return validation_error("Valid salesperson not found.")

    # Decrease available quantity
    stock.quantity_available -= quantity

    allocation = StockAllocation(
        stock_id=stock.id,
        salesperson_id=salesperson.id,
        finance_user_id=finance.id,
        quantity_allocated=quantity,
        remarks=remarks,
    )

    db.session.add(allocation)
    db.session.commit()

    # Notify Salesperson
    push(
        salesperson.id,
        f"You have received {quantity} units of {stock.product_name}.",
        "stock"
    )

    # Notify Distributor
    push(
        stock.distributor_id,
        f"Finance allocated {quantity} units of {stock.product_name} to {salesperson.email}.",
        "stock"
    )

    return jsonify({"allocation": allocation.to_dict()}), 201


@distributor_stock_bp.get("/my-assigned")
@jwt_required()
def list_my_assigned_stock():
    user, error = require_current_user()
    if error:
        return error

    if user.role != "sales":
        return jsonify({"message": "Only salespeople can view assigned stock."}), 403

    allocations = StockAllocation.query.filter_by(salesperson_id=user.id).order_by(StockAllocation.allocated_at.desc()).all()
    return jsonify({"allocations": [a.to_dict() for a in allocations]})
