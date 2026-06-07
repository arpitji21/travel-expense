import os
from uuid import uuid4

from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename

from app.extensions import db
from app.models import Claim, Expense
from app.routes.helpers import (
    apply_claim_total,
    get_claim_for_user,
    json_body,
    parse_date,
    parse_decimal,
    require_current_user,
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

    query = Expense.query.join(Expense.claim)
    if user.role != "finance":
        query = query.filter(Claim.user_id == user.id)

    expenses = query.order_by(Expense.expense_date.desc()).all()
    return jsonify({"expenses": [expense.to_dict() for expense in expenses]})


@expenses_bp.get("/<int:expense_id>")
@jwt_required()
def get_expense(expense_id):
    user, error = require_current_user()

    if error:
        return error

    expense = Expense.query.get(expense_id)

    if not expense or not get_claim_for_user(expense.claim_id, user):
        return jsonify({"message": "Expense not found."}), 404

    return jsonify({"expense": expense.to_dict()})


@expenses_bp.post("")
@jwt_required()
def create_expense():
    user, error = require_current_user()

    if error:
        return error

    data = json_body()
    claim = get_claim_for_user(data.get("claimId"), user)

    if not claim:
        return jsonify({"message": "Claim not found."}), 404

    if claim.status != "draft":
        return validation_error("Expenses can only be added to draft claims.")

    try:
        amount = parse_decimal(data.get("amount"), "amount", required=True)
        expense_date = parse_date(data.get("expenseDate"), "expenseDate", required=True)
    except ValueError as exc:
        return validation_error(str(exc))

    category = (data.get("category") or "").strip()
    currency = (data.get("currency") or claim.currency).strip().upper()

    if not category:
        return validation_error("category is required.")

    if amount < 0:
        return validation_error("amount cannot be negative.")

    if len(currency) != 3:
        return validation_error("currency must be a 3-letter code.")

    expense = Expense(
        claim_id=claim.id,
        category=category,
        description=(data.get("description") or "").strip() or None,
        amount=amount,
        currency=currency,
        expense_date=expense_date,
        receipt_url=(data.get("receiptUrl") or "").strip() or None,
    )

    db.session.add(expense)
    db.session.flush()
    apply_claim_total(claim)
    db.session.commit()

    return jsonify({"expense": expense.to_dict(), "claim": claim.to_dict()}), 201


@expenses_bp.post("/<int:expense_id>/receipt")
@jwt_required()
def upload_receipt(expense_id):
    user, error = require_current_user()

    if error:
        return error

    expense = Expense.query.get(expense_id)

    if not expense:
        return jsonify({"message": "Expense not found."}), 404

    claim = get_claim_for_user(expense.claim_id, user)

    if not claim:
        return jsonify({"message": "Expense not found."}), 404

    if claim.status != "draft":
        return validation_error("Receipts can only be uploaded for draft claims.")

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

    return jsonify({"expense": expense.to_dict(), "claim": claim.to_dict()})


@expenses_bp.put("/<int:expense_id>")
@jwt_required()
def update_expense(expense_id):
    user, error = require_current_user()

    if error:
        return error

    expense = Expense.query.get(expense_id)

    if not expense:
        return jsonify({"message": "Expense not found."}), 404

    claim = get_claim_for_user(expense.claim_id, user)

    if not claim:
        return jsonify({"message": "Expense not found."}), 404

    if claim.status != "draft":
        return validation_error("Expenses can only be updated on draft claims.")

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

    if "receiptUrl" in data:
        expense.receipt_url = (data.get("receiptUrl") or "").strip() or None

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

    apply_claim_total(claim)
    db.session.commit()

    return jsonify({"expense": expense.to_dict(), "claim": claim.to_dict()})


@expenses_bp.delete("/<int:expense_id>")
@jwt_required()
def delete_expense(expense_id):
    user, error = require_current_user()

    if error:
        return error

    expense = Expense.query.get(expense_id)

    if not expense:
        return jsonify({"message": "Expense not found."}), 404

    claim = get_claim_for_user(expense.claim_id, user)

    if not claim:
        return jsonify({"message": "Expense not found."}), 404

    if claim.status != "draft":
        return validation_error("Expenses can only be deleted from draft claims.")

    db.session.delete(expense)
    db.session.flush()
    apply_claim_total(claim)
    db.session.commit()

    return jsonify({"message": "Expense deleted.", "claim": claim.to_dict()})
