from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from app.extensions import db
from app.models import User

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    role = (data.get("role") or "sales").strip().lower()

    if not email or not password:
        return jsonify({"message": "Email and password are required."}), 400

    if len(password) < 6:
        return jsonify({"message": "Password must be at least 6 characters."}), 400

    if role not in {"sales", "finance", "distributor"}:
        return jsonify(
            {"message": "Department must be sales, finance, or distributor."}
        ), 400
    
    print("===== ALL USERS =====")
    for u in User.query.all():
        print(u.id, u.email, u.role)


    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email is already registered."}), 409

    user = User(email=email, role=role)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    # Log the new user in straight away.
    access_token = create_access_token(identity=str(user.id))

    return jsonify(
        {
            "accessToken": access_token,
            "user": user.to_dict(),
        }
    ), 201


@auth_bp.post("/login")
def login():
    print("===== LOGIN ROUTE HIT =====")

    data = request.get_json(silent=True) or {}
    print("LOGIN DATA:", data)

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = User.query.filter_by(email=email).first()

    print("USER FOUND:", user.email if user else None)

    if user:
        print("PASSWORD MATCH:", user.check_password(password))

    if not user or not user.check_password(password):
        return jsonify({"message": "Invalid credentials."}), 401

    access_token = create_access_token(identity=str(user.id))

    return jsonify({"accessToken": access_token, "user": user.to_dict()})

@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))

    if not user:
        return jsonify({"message": "User not found."}), 404

    return jsonify(user.to_dict())