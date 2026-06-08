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

    # Absolute so file saving and Flask's send_from_directory agree (the latter
    # resolves a relative path against the app package dir, not the CWD).
    UPLOAD_FOLDER = os.path.abspath(
        os.getenv(
            "UPLOAD_FOLDER",
            os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "receipts"),
        )
    )
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", 25 * 1024 * 1024))
    ALLOWED_RECEIPT_EXTENSIONS = {"pdf", "png", "jpg", "jpeg", "webp"}
    # Documents/images allowed for material uploads. Videos are NOT uploaded
    # (use an external link instead, e.g. a Google Drive / YouTube URL).
    ALLOWED_MATERIAL_EXTENSIONS = {
        "pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt", "csv",
        "png", "jpg", "jpeg", "webp", "gif",
    }

    # Cloudflare R2 (S3-compatible object storage) for uploaded bills. When all
    # of these are set, receipts are stored in R2 instead of the local disk so
    # the finance department can view them even on ephemeral hosting where the
    # filesystem is wiped on redeploy. Leave them blank to use local storage.
    R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID")
    R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID")
    R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY")
    R2_BUCKET = os.getenv("R2_BUCKET")
    # Public base URL for the bucket: the r2.dev dev URL or a custom domain,
    # e.g. https://pub-xxxxxxxx.r2.dev
    R2_PUBLIC_BASE_URL = os.getenv("R2_PUBLIC_BASE_URL")

    # Email notifications (Gmail SMTP). When MAIL_USERNAME + MAIL_PASSWORD are
    # set, the salesperson is emailed when finance approves or reimburses their
    # expense. Use a Gmail address + an App Password (not your normal password).
    # Leave blank to disable — sending then becomes a logged no-op.
    MAIL_SMTP_HOST = os.getenv("MAIL_SMTP_HOST", "smtp.gmail.com")
    MAIL_SMTP_PORT = int(os.getenv("MAIL_SMTP_PORT", 587))
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    # Optional "From" header; defaults to MAIL_USERNAME.
    MAIL_FROM = os.getenv("MAIL_FROM")

    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
        if origin.strip()
    ]
