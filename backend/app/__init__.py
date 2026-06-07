import os

from flask import Flask, send_from_directory
from flask_cors import CORS

from app.config import Config
from app.extensions import db, jwt, migrate
from app.models import Demand, Expense, ScheduleEntry, User  # noqa: F401
from app.routes.auth import auth_bp
from app.routes.demands import demands_bp
from app.routes.expenses import expenses_bp
from app.routes.health import health_bp
from app.routes.schedule import schedule_bp
from app.routes.users import users_bp


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})

    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(demands_bp, url_prefix="/api/demands")
    app.register_blueprint(expenses_bp, url_prefix="/api/expenses")
    app.register_blueprint(schedule_bp, url_prefix="/api/schedule")
    app.register_blueprint(users_bp, url_prefix="/api/users")

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    @app.get("/uploads/receipts/<path:filename>")
    def uploaded_receipt(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    @app.cli.command("init-db")
    def init_db():
        db.create_all()
        print("Database tables created.")

    @app.cli.command("seed-users")
    def seed_users():
        seed_data = [
            {"email": "sales@example.com", "password": "password123", "role": "sales"},
            {"email": "finance@example.com", "password": "password123", "role": "finance"},
        ]

        for item in seed_data:
            user = User.query.filter_by(email=item["email"]).first()
            if not user:
                user = User(email=item["email"], role=item["role"])
                user.set_password(item["password"])
                db.session.add(user)
            else:
                user.role = item["role"]
                user.set_password(item["password"])

        db.session.commit()
        print("Seed users created.")

    return app
