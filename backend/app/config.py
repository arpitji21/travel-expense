import os
from urllib.parse import quote_plus

from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-key")

    MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT = os.getenv("MYSQL_PORT", "3306")
    MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "travel_expense")
    MYSQL_USER = os.getenv("MYSQL_USER", "travel_user")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "travel_password")

    # Use DATABASE_URL when provided (sqlite for a quick local run, or the
    # Postgres URL that hosts like Render inject), otherwise build the MySQL
    # connection string from the MYSQL_* settings.
    _database_url = os.getenv("DATABASE_URL")
    if _database_url:
        # Normalise the scheme that managed Postgres providers hand out so
        # SQLAlchemy uses the psycopg2 driver.
        if _database_url.startswith("postgres://"):
            _database_url = _database_url.replace("postgres://", "postgresql+psycopg2://", 1)
        elif _database_url.startswith("postgresql://"):
            _database_url = _database_url.replace("postgresql://", "postgresql+psycopg2://", 1)

    SQLALCHEMY_DATABASE_URI = _database_url or (
        "mysql+pymysql://"
        f"{quote_plus(MYSQL_USER)}:{quote_plus(MYSQL_PASSWORD)}"
        f"@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    UPLOAD_FOLDER = os.getenv(
        "UPLOAD_FOLDER",
        os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "receipts"),
    )
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", 5 * 1024 * 1024))
    ALLOWED_RECEIPT_EXTENSIONS = {"pdf", "png", "jpg", "jpeg", "webp"}

    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
        if origin.strip()
    ]
