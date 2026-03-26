# backend/app/api/v1/admin/routes.py

from flask import Blueprint, jsonify, session, request # <-- request added
from app.db_utils import get_db_connection
from app.email_utils import send_email

# Create the Blueprint for admin-specific routes
admin_bp = Blueprint('admin_v1', __name__, url_prefix='/api/v1/admin')


@admin_bp.route('/pending-approvals', methods=['GET'])
def get_pending_approvals():
    """
    Fetches all doctors and pharmacies with a 'pending' status.
    This route is now protected by checking the Flask session.
    """
    # --- NEW SESSION-BASED PROTECTION ---
    if 'user_id' not in session:
        return jsonify({"error": "Authentication required. Please log in."}), 401
    if session.get('role') != 'admin':
        return jsonify({"error": "Admin access required."}), 403
    # --- END PROTECTION ---

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
            SELECT 
                u.id, u.full_name, u.email, u.mobile, u.aadhar_number, u.role, u.status,
                d.registration_number, dp.qualification, d.specialization,
                p.license_number, p.address,
                GROUP_CONCAT(docs.file_url, '|||') as document_urls
            FROM users u
            LEFT JOIN doctors d ON u.id = d.user_id
            LEFT JOIN doctor_profiles dp ON u.id = dp.user_id
            LEFT JOIN pharmacies p ON u.id = p.user_id
            LEFT JOIN documents docs ON u.id = docs.user_id
            WHERE (u.role = 'doctor' OR u.role = 'pharmacy') AND u.status LIKE 'pending_%'
            GROUP BY u.id
            ORDER BY u.created_at DESC
        """
        cursor.execute(query)
        pending_users = cursor.fetchall()
        
        return jsonify(pending_users), 200

    except Exception as e:
        print(f"Error fetching pending approvals: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


@admin_bp.route('/users/<int:user_id>/approve', methods=['POST'])
def approve_user(user_id):
    """Approves a user and sends a notification email."""
    # --- NEW SESSION-BASED PROTECTION ---
    if 'user_id' not in session:
        return jsonify({"error": "Authentication required. Please log in."}), 401
    if session.get('role') != 'admin':
        return jsonify({"error": "Admin access required."}), 403
    # --- END PROTECTION ---

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("SELECT email, full_name FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": "User not found"}), 404

        cursor.execute("UPDATE users SET status = 'active' WHERE id = %s", (user_id,))
        conn.commit()
        
        subject = "Your SwasthyaSetu Account has been Approved!"
        body = f"Hello {user['full_name']},\n\nCongratulations! Your account has been reviewed and approved. You can now log in and access your dashboard.\n\nThank you,\nThe SwasthyaSetu Team"
        send_email(to_email=user['email'], subject=subject, body=body)
            
        return jsonify({"message": "User approved successfully"}), 200

    except Exception as e:
        if conn and conn.is_connected(): conn.rollback()
        return jsonify({"error": "An internal server error occurred"}), 500
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


@admin_bp.route('/users/details', methods=['GET'])
def get_users_details():
    """
    Fetches detailed info for users based on role and status.
    Supports filtering by role (required) and optional status.
    """
    if 'user_id' not in session: return jsonify({"error": "Auth required"}), 401
    if session.get('role') != 'admin': return jsonify({"error": "Admin access required"}), 403
    
    role = request.args.get('role')
    status = request.args.get('status')
    
    if not role:
        return jsonify({"error": "Role parameter is required"}), 400

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
            SELECT 
                u.id, u.full_name, u.email, u.mobile, u.aadhar_number, u.role, u.status, u.created_at,
                d.registration_number, dp.qualification, d.specialization,
                p.license_number, p.address,
                GROUP_CONCAT(docs.file_url, '|||') as document_urls
            FROM users u
            LEFT JOIN doctors d ON u.id = d.user_id
            LEFT JOIN doctor_profiles dp ON u.id = dp.user_id
            LEFT JOIN pharmacies p ON u.id = p.user_id
            LEFT JOIN documents docs ON u.id = docs.user_id
            WHERE u.role = %s
        """
        params = [role]
        
        if status:
            if status == 'pending':
                query += " AND u.status LIKE 'pending_%'"
            else:
                query += " AND u.status = %s"
                params.append(status)
        
        query += " GROUP BY u.id ORDER BY u.created_at DESC"
        
        cursor.execute(query, tuple(params))
        users = cursor.fetchall()
        return jsonify(users), 200

    except Exception as e:
        print(f"Error fetching detailed users: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


@admin_bp.route('/users', methods=['GET'])
def get_all_users():
    """Fetches all users, optionally filtered by role."""
    if 'user_id' not in session: return jsonify({"error": "Auth required"}), 401
    if session.get('role') != 'admin': return jsonify({"error": "Admin access required"}), 403
    
    role = request.args.get('role')
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = "SELECT id, full_name, email, mobile, role, status, created_at FROM users"
        params = []
        if role:
            query += " WHERE role = %s"
            params.append(role)
        
        query += " ORDER BY created_at DESC"
        
        cursor.execute(query, tuple(params))
        users = cursor.fetchall()
        return jsonify(users), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


@admin_bp.route('/users/<int:user_id>/reject', methods=['POST'])
def reject_user(user_id):
    """Rejects a user, deletes their data, and sends a notification email."""
    # --- NEW SESSION-BASED PROTECTION ---
    if 'user_id' not in session:
        return jsonify({"error": "Authentication required. Please log in."}), 401
    if session.get('role') != 'admin':
        return jsonify({"error": "Admin access required."}), 403
    # --- END PROTECTION ---

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("SELECT email, full_name FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": "User not found or already deleted"}), 404

        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()
        
        subject = "Update on Your SwasthyaSetu Account Registration"
        body = f"Hello {user['full_name']},\n\nAfter reviewing your application, we regret to inform you that it could not be approved at this time. If you believe this is an error, please contact support.\n\nThank you,\nThe SwasthyaSetu Team"
        send_email(to_email=user['email'], subject=subject, body=body)
        
        return jsonify({"message": "User rejected and data deleted successfully"}), 200

    except Exception as e:
        if conn and conn.is_connected(): conn.rollback()
        return jsonify({"error": "An internal server error occurred"}), 500
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()
