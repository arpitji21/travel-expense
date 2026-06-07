from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

from app.extensions import db
from app.models import Claim
from app.routes.helpers import (
    get_claim_for_user,
    json_body,
    require_current_user,
    require_finance_user,
    utc_now,
    validation_error,
)

claims_bp = Blueprint("claims", __name__)

VALID_STATUSES = {"draft", "submitted", "approved", "rejected", "reimbursed"}


@claims_bp.get("")
@jwt_required()
def list_claims():
    user, error = require_current_user()

    if error:
        return error

    query = Claim.query
    if user.role != "finance":
        query = query.filter_by(user_id=user.id)

    claims = query.order_by(Claim.created_at.desc()).all()
    return jsonify({"claims": [claim.to_dict() for claim in claims]})


@claims_bp.post("")
@jwt_required()
def create_claim():
    user, error = require_current_user()

    if error:
        return error

    data = json_body()
    title = (data.get("title") or "").strip()
    purpose = (data.get("purpose") or "").strip() or None
    currency = (data.get("currency") or "USD").strip().upper()

    if not title:
        return validation_error("title is required.")

    if len(currency) != 3:
        return validation_error("currency must be a 3-letter code.")

    claim = Claim(user_id=user.id, title=title, purpose=purpose, currency=currency)

    db.session.add(claim)
    db.session.commit()

    return jsonify({"claim": claim.to_dict(include_children=True)}), 201


@claims_bp.get("/<int:claim_id>")
@jwt_required()
def get_claim(claim_id):
    user, error = require_current_user()

    if error:
        return error

    claim = get_claim_for_user(claim_id, user)

    if not claim:
        return jsonify({"message": "Claim not found."}), 404

    return jsonify({"claim": claim.to_dict(include_children=True)})


@claims_bp.put("/<int:claim_id>")
@jwt_required()
def update_claim(claim_id):
    user, error = require_current_user()

    if error:
        return error

    claim = get_claim_for_user(claim_id, user)

    if not claim:
        return jsonify({"message": "Claim not found."}), 404

    if user.role != "finance" and claim.status != "draft":
        return validation_error("Only draft claims can be edited.")

    data = json_body()
    title = data.get("title")
    purpose = data.get("purpose")
    currency = data.get("currency")
    status = data.get("status")

    if title is not None:
        title = title.strip()
        if not title:
            return validation_error("title cannot be empty.")
        claim.title = title

    if purpose is not None:
        claim.purpose = purpose.strip() or None

    if currency is not None:
        currency = currency.strip().upper()
        if len(currency) != 3:
            return validation_error("currency must be a 3-letter code.")
        claim.currency = currency

    if status is not None:
        return validation_error("Use workflow action endpoints to change claim status.")

    db.session.commit()

    return jsonify({"claim": claim.to_dict(include_children=True)})


@claims_bp.post("/<int:claim_id>/submit")
@jwt_required()
def submit_claim(claim_id):
    user, error = require_current_user()

    if error:
        return error

    claim = get_claim_for_user(claim_id, user)

    if not claim:
        return jsonify({"message": "Claim not found."}), 404

    if not claim.travel_legs:
        return validation_error("Add at least one travel leg before submitting.")

    if not claim.expenses:
        return validation_error("Add at least one expense before submitting.")

    claim.status = "submitted"
    claim.submitted_at = utc_now()
    db.session.commit()

    return jsonify({"claim": claim.to_dict(include_children=True)})


@claims_bp.post("/<int:claim_id>/approve")
@jwt_required()
def approve_claim(claim_id):
    _, error = require_finance_user()

    if error:
        return error

    claim = Claim.query.get(claim_id)

    if not claim:
        return jsonify({"message": "Claim not found."}), 404

    if claim.status != "submitted":
        return validation_error("Only submitted claims can be approved.")

    claim.status = "approved"
    db.session.commit()

    return jsonify({"claim": claim.to_dict(include_children=True)})


@claims_bp.post("/<int:claim_id>/reject")
@jwt_required()
def reject_claim(claim_id):
    _, error = require_finance_user()

    if error:
        return error

    claim = Claim.query.get(claim_id)

    if not claim:
        return jsonify({"message": "Claim not found."}), 404

    if claim.status != "submitted":
        return validation_error("Only submitted claims can be rejected.")

    claim.status = "rejected"
    db.session.commit()

    return jsonify({"claim": claim.to_dict(include_children=True)})


@claims_bp.post("/<int:claim_id>/reimburse")
@jwt_required()
def reimburse_claim(claim_id):
    _, error = require_finance_user()

    if error:
        return error

    claim = Claim.query.get(claim_id)

    if not claim:
        return jsonify({"message": "Claim not found."}), 404

    if claim.status != "approved":
        return validation_error("Only approved claims can be marked reimbursed.")

    claim.status = "reimbursed"
    db.session.commit()

    return jsonify({"claim": claim.to_dict(include_children=True)})


@claims_bp.delete("/<int:claim_id>")
@jwt_required()
def delete_claim(claim_id):
    user, error = require_current_user()

    if error:
        return error

    claim = get_claim_for_user(claim_id, user)

    if not claim:
        return jsonify({"message": "Claim not found."}), 404

    if claim.status != "draft":
        return validation_error("Only draft claims can be deleted.")

    db.session.delete(claim)
    db.session.commit()

    return jsonify({"message": "Claim deleted."})
