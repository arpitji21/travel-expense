import os
from uuid import uuid4

from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename

from app.extensions import db
from app.models import Expense
from app.routes.helpers import (
    get_expense_for_user,
    json_body,
    parse_date,
    parse_decimal,
    require_current_user,
    require_finance_user,
    validation_error,
)

expenses_bp = Blueprint("expenses", __name__)


def allowed_receipt_file(filename):
    if "." not in filename:
        return False

    extension = filename.rsplit(".", 1)[1].lower()
    return extension in current_app.config["ALLOWED_RECEIPT_EXTENSIONS"]


@expenses_bp.get("")
@jwt_required()
def list_expenses():
    user, error = require_current_user()

    if error:
        return error

    query = Expense.query

    if user.role == "finance":
        # Finance can filter the expense list by a particular salesperson.
        user_id = request.args.get("userId", type=int)
        if user_id:
            query = query.filter_by(user_id=user_id)
    else:
        query = query.filter_by(user_id=user.id)

    expenses = query.order_by(Expense.expense_date.desc()).all()
    return jsonify({"expenses": [expense.to_dict() for expense in expenses]})


@expenses_bp.get("/<int:expense_id>")
@jwt_required()
def get_expense(expense_id):
    user, error = require_current_user()

    if error:
        return error

    expense = get_expense_for_user(expense_id, user)

    if not expense:
        return jsonify({"message": "Expense not found."}), 404

    return jsonify({"expense": expense.to_dict()})


@expenses_bp.post("")
@jwt_required()
def create_expense():
    user, error = require_current_user()

    if error:
        return error

    data = json_body()

    try:
        amount = parse_decimal(data.get("amount"), "amount", required=True)
        expense_date = parse_date(data.get("expenseDate"), "expenseDate", required=True)
    except ValueError as exc:
        return validation_error(str(exc))

    category = (data.get("category") or "Metro").strip() or "Metro"
    currency = (data.get("currency") or "INR").strip().upper()

    if amount < 0:
        return validation_error("amount cannot be negative.")

    if len(currency) != 3:
        return validation_error("currency must be a 3-letter code.")

    expense = Expense(
        user_id=user.id,
        category=category,
        description=(data.get("description") or "").strip() or None,
        amount=amount,
        currency=currency,
        expense_date=expense_date,
        receipt_url=(data.get("receiptUrl") or "").strip() or None,
    )

    db.session.add(expense)
    db.session.commit()

    return jsonify({"expense": expense.to_dict()}), 201


@expenses_bp.post("/<int:expense_id>/receipt")
@jwt_required()
def upload_receipt(expense_id):
    user, error = require_current_user()

    if error:
        return error

    expense = get_expense_for_user(expense_id, user)

    if not expense:
        return jsonify({"message": "Expense not found."}), 404

    if user.role != "finance" and expense.status != "submitted":
        return validation_error("Receipts can only be changed while the expense is pending review.")

    receipt = request.files.get("receipt")

    if not receipt or not receipt.filename:
        return validation_error("receipt file is required.")

    if not allowed_receipt_file(receipt.filename):
        return validation_error("receipt must be a PDF or image file.")

    original_name = secure_filename(receipt.filename)
    extension = original_name.rsplit(".", 1)[1].lower()
    filename = f"{uuid4().hex}.{extension}"
    upload_folder = current_app.config["UPLOAD_FOLDER"]
    os.makedirs(upload_folder, exist_ok=True)
    receipt.save(os.path.join(upload_folder, filename))

    expense.receipt_url = f"/uploads/receipts/{filename}"
    db.session.commit()

    return jsonify({"expense": expense.to_dict()})


@expenses_bp.put("/<int:expense_id>")
@jwt_required()
def update_expense(expense_id):
    user, error = require_current_user()

    if error:
        return error

    expense = get_expense_for_user(expense_id, user)

    if not expense:
        return jsonify({"message": "Expense not found."}), 404

    if user.role != "finance" and expense.status != "submitted":
        return validation_error("Expenses can only be edited while pending review.")

    data = json_body()

    if "category" in data:
        category = (data.get("category") or "").strip()
        if not category:
            return validation_error("category cannot be empty.")
        expense.category = category

    if "description" in data:
        expense.description = (data.get("description") or "").strip() or None

    if "currency" in data:
        currency = (data.get("currency") or "").strip().upper()
        if len(currency) != 3:
            return validation_error("currency must be a 3-letter code.")
        expense.currency = currency

    try:
        if "amount" in data:
            amount = parse_decimal(data.get("amount"), "amount", required=True)
            if amount < 0:
                return validation_error("amount cannot be negative.")
            expense.amount = amount
        if "expenseDate" in data:
            expense.expense_date = parse_date(data.get("expenseDate"), "expenseDate", required=True)
    except ValueError as exc:
        return validation_error(str(exc))

    db.session.commit()

    return jsonify({"expense": expense.to_dict()})


def _finance_status_change(expense_id, from_status, to_status, action_label):
    _, error = require_finance_user()

    if error:
        return error

    expense = Expense.query.get(expense_id)

    if not expense:
        return jsonify({"message": "Expense not found."}), 404

    if expense.status != from_status:
        return validation_error(f"Only {from_status} expenses can be {action_label}.")

    expense.status = to_status
    db.session.commit()

    return jsonify({"expense": expense.to_dict()})


@expenses_bp.post("/<int:expense_id>/approve")
@jwt_required()
def approve_expense(expense_id):
    return _finance_status_change(expense_id, "submitted", "approved", "approved")


@expenses_bp.post("/<int:expense_id>/reject")
@jwt_required()
def reject_expense(expense_id):
    return _finance_status_change(expense_id, "submitted", "rejected", "rejected")


@expenses_bp.post("/<int:expense_id>/reimburse")
@jwt_required()
def reimburse_expense(expense_id):
    return _finance_status_change(expense_id, "approved", "reimbursed", "marked reimbursed")


@expenses_bp.delete("/<int:expense_id>")
@jwt_required()
def delete_expense(expense_id):
    user, error = require_current_user()

    if error:
        return error

    expense = get_expense_for_user(expense_id, user)

    if not expense:
        return jsonify({"message": "Expense not found."}), 404

    if user.role != "finance" and expense.status != "submitted":
        return validation_error("Expenses can only be deleted while pending review.")

    db.session.delete(expense)
    db.session.commit()

    return jsonify({"message": "Expense deleted."})
