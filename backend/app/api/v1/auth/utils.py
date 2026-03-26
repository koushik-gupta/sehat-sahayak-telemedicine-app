# app/api/v1/auth/utils.py

from functools import wraps
from flask import session, jsonify
from app.db_utils import get_db_connection

def login_required(f):
    """
    A decorator to ensure a user is logged in via session before accessing a route.
    It also fetches the current user's data and passes it to the decorated function.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"error": "Authentication required. Please log in."}), 401
        
        user_id = session['user_id']
        conn = None
        current_user = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT id, full_name, role, status FROM users WHERE id = %s", (user_id,))
            current_user = cursor.fetchone()
        except Exception as e:
            print(f"Database error in login_required: {e}")
            return jsonify({"error": "An error occurred while verifying user session."}), 500
        finally:
            if conn and conn.is_connected():
                cursor.close()
                conn.close()

        if current_user is None:
            session.clear() # Clear invalid session
            return jsonify({"error": "User not found. Please log in again."}), 401

        # Pass the fetched user object to the decorated route function
        return f(current_user, *args, **kwargs)
    return decorated_function