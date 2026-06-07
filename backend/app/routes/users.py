from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

from app.extensions import db
from app.models import User
from app.routes.helpers import json_body, require_current_user, require_finance_user, validation_error

users_bp = Blueprint("users", __name__)


@users_bp.get("")
@jwt_required()
def list_users():
    _, error = require_finance_user()

    if error:
        return error

    users = User.query.order_by(User.email.asc()).all()
    return jsonify({"users": [item.to_dict() for item in users]})


@users_bp.post("")
@jwt_required()
def create_user():
    _, error = require_finance_user()

    if error:
        return error

    data = json_body()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    role = (data.get("role") or "sales").strip().lower()

    if not email or not password:
        return validation_error("email and password are required.")

    if role not in {"sales", "finance"}:
        return validation_error("role must be sales or finance.")

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email is already registered."}), 409

    user = User(email=email, role=role)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    return jsonify({"user": user.to_dict()}), 201


@users_bp.get("/<int:user_id>")
@jwt_required()
def get_user(user_id):
    user, error = require_current_user()

    if error:
        return error

    if user.role != "finance" and user.id != user_id:
        return jsonify({"message": "User not found."}), 404

    requested_user = User.query.get(user_id)

    if not requested_user:
        return jsonify({"message": "User not found."}), 404

    return jsonify({"user": requested_user.to_dict()})


@users_bp.put("/<int:user_id>")
@jwt_required()
def update_user(user_id):
    _, error = require_finance_user()

    if error:
        return error

    requested_user = User.query.get(user_id)

    if not requested_user:
        return jsonify({"message": "User not found."}), 404

    data = json_body()

    if "email" in data:
        email = (data.get("email") or "").strip().lower()
        if not email:
            return validation_error("email cannot be empty.")

        existing = User.query.filter_by(email=email).first()
        if existing and existing.id != requested_user.id:
            return jsonify({"message": "Email is already registered."}), 409

        requested_user.email = email

    if "role" in data:
        role = (data.get("role") or "").strip().lower()
        if role not in {"sales", "finance"}:
            return validation_error("role must be sales or finance.")
        requested_user.role = role

    if "password" in data:
        password = data.get("password") or ""
        if not password:
            return validation_error("password cannot be empty.")
        requested_user.set_password(password)

    db.session.commit()

    return jsonify({"user": requested_user.to_dict()})


@users_bp.delete("/<int:user_id>")
@jwt_required()
def delete_user(user_id):
    actor, error = require_finance_user()

    if error:
        return error

    if actor.id == user_id:
        return validation_error("You cannot delete your own user.")

    requested_user = User.query.get(user_id)

    if not requested_user:
        return jsonify({"message": "User not found."}), 404

    db.session.delete(requested_user)
    db.session.commit()

    return jsonify({"message": "User deleted."})
