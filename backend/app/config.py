import os
from pathlib import Path

from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()


def _get_bool_env(name, default=False):
    value = os.environ.get(name)
    if value is None:
        return default
    return value.lower() in ['true', '1', 't', 'yes', 'on']


def _get_list_env(name, default=""):
    value = os.environ.get(name, default)
    return [item.strip().rstrip('/') for item in value.split(',') if item.strip()]


def _resolve_path_env(name, default_path, *, base_dir):
    value = os.environ.get(name)
    candidate = Path(value).expanduser() if value else Path(default_path)
    if not candidate.is_absolute():
        candidate = base_dir / candidate
    return str(candidate.resolve(strict=False))


BACKEND_DIR = Path(__file__).resolve().parents[1]
DEFAULT_UPLOAD_FOLDER = (BACKEND_DIR / 'uploads').resolve(strict=False)
DEFAULT_DB_PATH = (BACKEND_DIR / 'data' / 'telemedicine.sqlite3').resolve(strict=False)
DEFAULT_SQLITE_SEED_PATH = (BACKEND_DIR / 'seed' / 'telemedicine.seed.sqlite3').resolve(strict=False)
DEFAULT_SQLITE_SCHEMA_PATH = (BACKEND_DIR / 'seed' / 'telemedicine.schema.sql').resolve(strict=False)


class Config:
    """Base configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'a_default_secret_key_for_development')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'a_default_jwt_secret_key')
    DEBUG = _get_bool_env('FLASK_DEBUG', False)
    PUBLIC_BACKEND_URL = os.environ.get('PUBLIC_BACKEND_URL', '').rstrip('/')
    CORS_ORIGINS = _get_list_env('CORS_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173')
    UPLOAD_FOLDER = _resolve_path_env('UPLOAD_FOLDER', DEFAULT_UPLOAD_FOLDER, base_dir=BACKEND_DIR)
    DB_PATH = _resolve_path_env('DB_PATH', DEFAULT_DB_PATH, base_dir=BACKEND_DIR)
    SQLITE_SEED_PATH = _resolve_path_env('SQLITE_SEED_PATH', DEFAULT_SQLITE_SEED_PATH, base_dir=BACKEND_DIR)
    SQLITE_SCHEMA_PATH = _resolve_path_env('SQLITE_SCHEMA_PATH', DEFAULT_SQLITE_SCHEMA_PATH, base_dir=BACKEND_DIR)
    SESSION_COOKIE_NAME = os.environ.get('SESSION_COOKIE_NAME', 'swasthyasetu_session')
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SECURE = _get_bool_env('SESSION_COOKIE_SECURE', False)
    SESSION_COOKIE_SAMESITE = os.environ.get('SESSION_COOKIE_SAMESITE', 'Lax')
    PREFERRED_URL_SCHEME = 'https' if SESSION_COOKIE_SECURE else 'http'

    # Email configuration
    MAIL_SERVER = os.environ.get('MAIL_SERVER')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() in ['true', '1', 't']
    MAIL_USE_SSL = os.environ.get('MAIL_USE_SSL', 'false').lower() in ['true', '1', 't']
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER')

    TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID')
    TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN')
    TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER')

    GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY')
    GROQ_API_KEY = os.environ.get('GROQ_API_KEY')
    GOOGLE_MAPS_API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY')
