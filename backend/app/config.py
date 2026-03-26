import os
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


BACKEND_DIR = os.path.dirname(os.path.dirname(__file__))
DEFAULT_UPLOAD_FOLDER = os.path.join(BACKEND_DIR, 'uploads')

class Config:
    """Base configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'a_default_secret_key_for_development')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'a_default_jwt_secret_key')
    DEBUG = _get_bool_env('FLASK_DEBUG', False)
    PUBLIC_BACKEND_URL = os.environ.get('PUBLIC_BACKEND_URL', '').rstrip('/')
    CORS_ORIGINS = _get_list_env('CORS_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173')
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', DEFAULT_UPLOAD_FOLDER)
    SESSION_COOKIE_NAME = os.environ.get('SESSION_COOKIE_NAME', 'swasthyasetu_session')
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SECURE = _get_bool_env('SESSION_COOKIE_SECURE', False)
    SESSION_COOKIE_SAMESITE = os.environ.get('SESSION_COOKIE_SAMESITE', 'Lax')
    PREFERRED_URL_SCHEME = 'https' if SESSION_COOKIE_SECURE else 'http'
    
    # --- MySQL Database Configuration ---
    # Load from environment variables.
    # Create a .env file in your root directory to store these values.
    # Example .env file:
    # DB_HOST=localhost
    # DB_USER=your_mysql_user
    # DB_PASSWORD=your_mysql_password
    # DB_NAME=telemedicine_db
    
    DB_HOST = os.environ.get('DB_HOST')
    DB_USER = os.environ.get('DB_USER')
    DB_PASSWORD = os.environ.get('DB_PASSWORD')
    DB_NAME = os.environ.get('DB_NAME')
    # --- Email Configuration ---
    MAIL_SERVER = os.environ.get('MAIL_SERVER')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() in ['true', '1', 't']
    MAIL_USE_SSL = os.environ.get('MAIL_USE_SSL', 'false').lower() in ['true', '1', 't']
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER')
    # Inside the Config class in config.py
    TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID')
    TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN')
    TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER')

    GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY')
