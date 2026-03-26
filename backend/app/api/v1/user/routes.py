# backend/app/api/v1/user/routes.py

import time
import os
from flask import Blueprint, request, jsonify, session, current_app # <-- `session` is now used for protection
from werkzeug.utils import secure_filename
from app.db_utils import get_db_connection
from app.file_utils import get_upload_folder, public_url_for_path, relative_upload_url

# Create the Blueprint for general user routes
user_bp = Blueprint('user_v1', __name__, url_prefix='/api/v1/user')

# Define allowed file extensions for security
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}

def allowed_file(filename):
    """Helper function to check if the uploaded file has an allowed extension."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@user_bp.route('/upload-documents', methods=['POST'])
def upload_documents():
    """
    Handles document and professional detail uploads.
    This route is now protected by checking the Flask session.
    """
    # --- NEW SESSION-BASED PROTECTION ---
    # This block replaces the old @jwt_required() decorator.
    if 'user_id' not in session:
        return jsonify({"error": "Authentication required. Please log in."}), 401
    
    current_user_id = session['user_id']
    # --- END PROTECTION ---
    
    if 'document' not in request.files:
        return jsonify({"error": "No document file part in the request"}), 400

    file = request.files['document']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if not file or not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed"}), 400

    # Securely save the file
    filename = secure_filename(f"{current_user_id}_{file.filename}")
    upload_folder = get_upload_folder()
    file_path = os.path.join(upload_folder, filename)
    file.save(file_path)
    file_url = relative_upload_url(filename)

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        conn.start_transaction()

        cursor.execute("SELECT role FROM users WHERE id = %s", (current_user_id,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": "User not found"}), 404

        # 1. Save the document link to the 'documents' table
        doc_query = "INSERT INTO documents (user_id, file_name, file_url) VALUES (%s, %s, %s)"
        cursor.execute(doc_query, (current_user_id, filename, file_url))

        # 2. Update role-specific details if provided (for doctors)
        if user['role'] == 'doctor':
            qualification = request.form.get('qualification')
            specialization = request.form.get('specialization')
            if qualification and specialization:
                doc_update_query = "UPDATE doctors SET qualification = %s, specialization = %s WHERE user_id = %s"
                cursor.execute(doc_update_query, (qualification, specialization, current_user_id))
            
            # Only set status to pending for doctors/partners who need approval
            status_update_query = "UPDATE users SET status = 'pending_admin_approval' WHERE id = %s"
            cursor.execute(status_update_query, (current_user_id,))

        conn.commit()

        return jsonify({"message": "Documents submitted successfully. Awaiting admin review."}), 200

    except Exception as e:
        if conn: conn.rollback()
        print(f"Document Upload Error: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500
    finally:
            conn.close()

@user_bp.route('/documents', methods=['GET'])
def get_documents():
    """
    Fetches all documents uploaded by the current user.
    """
    if 'user_id' not in session:
        return jsonify({"error": "Authentication required"}), 401
    
    user_id = session['user_id']
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("SELECT * FROM documents WHERE user_id = %s ORDER BY uploaded_at DESC", (user_id,))
        documents = cursor.fetchall()
        for document in documents:
            document['file_url'] = public_url_for_path(document.get('file_url'))
        
        return jsonify(documents), 200
    except Exception as e:
        print(f"Fetch Documents Error: {e}")
        return jsonify({"error": "Failed to fetch documents"}), 500
    finally:
        if conn: conn.close()

@user_bp.route('/delete-document/<int:doc_id>', methods=['DELETE'])
def delete_document(doc_id):
    """
    Deletes a specific document uploaded by the current user.
    """
    if 'user_id' not in session:
        return jsonify({"error": "Authentication required"}), 401
    
    user_id = session['user_id']
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        conn.start_transaction()

        # 1. Verify ownership and get filename
        cursor.execute("SELECT file_name FROM documents WHERE id = %s AND user_id = %s", (doc_id, user_id))
        document = cursor.fetchone()

        if not document:
            return jsonify({"error": "Document not found or unauthorized"}), 404

        # 2. Delete from Database
        cursor.execute("DELETE FROM documents WHERE id = %s", (doc_id,))
        
        # 3. Delete from Filesystem
        filename = document['file_name']
        upload_folder = current_app.config['UPLOAD_FOLDER']
        file_path = os.path.join(upload_folder, filename)
        
        if os.path.exists(file_path):
            os.remove(file_path)
            
        conn.commit()
        return jsonify({"message": "Document deleted successfully"}), 200

    except Exception as e:
        if conn: conn.rollback()
        print(f"Delete Document Error: {e}")
        return jsonify({"error": "Failed to delete document"}), 500
    finally:
        if conn: conn.close()


@user_bp.route('/update-profile', methods=['POST'])
def update_profile():
    """
    Updates user profile details and profile picture.
    Handles both 'users' table and role-specific tables (e.g., 'patients').
    """
    if 'user_id' not in session:
        return jsonify({"error": "Authentication required"}), 401

    user_id = session['user_id']
    print(f"DEBUG: update_profile called by user_id={user_id}")
    
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        conn.start_transaction()

        # 1. Handle Profile Picture Upload
        profile_pic_url = None
        if 'profile_picture' in request.files:
            file = request.files['profile_picture']
            if file and allowed_file(file.filename):
                filename = secure_filename(f"profile_{user_id}_{int(time.time())}_{file.filename}")
                upload_folder = get_upload_folder()
                file_path = os.path.join(upload_folder, filename)
                file.save(file_path)
                profile_pic_url = relative_upload_url(filename)

        # 2. Update 'users' table (Common fields)
        full_name = request.form.get('full_name')
        email = request.form.get('email')
        mobile = request.form.get('mobile')
        
        # Helper to convert empty strings to None
        def clean_val(val):
            return val if val and val.strip() != "" else None

        update_user_query = "UPDATE users SET full_name = COALESCE(%s, full_name), email = COALESCE(%s, email), mobile = COALESCE(%s, mobile)"
        params = [clean_val(full_name), clean_val(email), clean_val(mobile)]
        
        # --- SENSITIVE DATA CHECK ---
        cursor.execute("SELECT email, mobile FROM users WHERE id = %s", (user_id,))
        current_data = cursor.fetchone()
        
        is_sensitive_change = False
        if email and current_data['email'] != email: is_sensitive_change = True
        if mobile and current_data['mobile'] != mobile: is_sensitive_change = True
        
        if is_sensitive_change:
            if not session.get('sensitive_update_verified'):
                if conn: conn.rollback()
                return jsonify({
                    "error": "Security Verification Required", 
                    "requires_verification": True
                }), 403
            
            # Reset the flag so it's one-time use
            session.pop('sensitive_update_verified', None)
        # ----------------------------

        if profile_pic_url:
            update_user_query += ", profile_picture = %s"
            params.append(profile_pic_url)
        
        update_user_query += " WHERE id = %s"
        params.append(user_id)
        
        cursor.execute(update_user_query, tuple(params))

        # 3. Update 'patients' table (Patient specific fields)
        cursor.execute("SELECT role FROM users WHERE id = %s", (user_id,))
        user_role = cursor.fetchone()
        print(f"DEBUG: User role is {user_role['role'] if user_role else 'None'}")

        if user_role and user_role['role'] == 'patient':
            dob = clean_val(request.form.get('dob'))
            gender = clean_val(request.form.get('gender'))
            address = clean_val(request.form.get('address'))
            blood_group = clean_val(request.form.get('blood_group'))
            weight = clean_val(request.form.get('weight'))
            height = clean_val(request.form.get('height'))
            
            # Update if the patient row exists; otherwise create it.
            cursor.execute("SELECT id FROM patients WHERE user_id = %s", (user_id,))
            if cursor.fetchone():
                print("DEBUG: Updating existing patient record")
                update_patient_query = """
                    UPDATE patients SET 
                    date_of_birth = COALESCE(%s, date_of_birth),
                    gender = COALESCE(%s, gender),
                    address = COALESCE(%s, address),
                    blood_group = COALESCE(%s, blood_group),
                    weight = COALESCE(%s, weight),
                    height = COALESCE(%s, height)
                    WHERE user_id = %s
                """
                cursor.execute(update_patient_query, (dob, gender, address, blood_group, weight, height, user_id))
            else:
                print("DEBUG: creating new patient record found, attempting insert")
                # Fallback: if patient record missing, create it.
                # Note: 'full_name' is required by schema, reusing 'full_name' from request or fetching
                insert_patient_query = """
                    INSERT INTO patients (user_id, full_name, date_of_birth, gender, address, blood_group, weight, height)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """
                # We need full_name. If not in request, fetch from users table?
                current_name = full_name
                if not current_name:
                    cursor.execute("SELECT full_name FROM users WHERE id = %s", (user_id,))
                    u = cursor.fetchone()
                    current_name = u['full_name'] if u else "Unknown"
                
                cursor.execute(insert_patient_query, (user_id, current_name, dob, gender, address, blood_group, weight, height))

        conn.commit()
        
        # Fetch updated user to return
        cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        updated_user = cursor.fetchone()
        
        if user_role['role'] == 'patient':
             cursor.execute("SELECT * FROM patients WHERE user_id = %s", (user_id,))
             patient_data = cursor.fetchone()
             if patient_data:
                 patient_data.pop('id', None)
                 patient_data.pop('user_id', None)
                 updated_user.update(patient_data)

        if updated_user:
            updated_user['profile_picture'] = public_url_for_path(updated_user.get('profile_picture'))
            del updated_user['password_hash']

        return jsonify({"message": "Profile updated successfully", "user": updated_user}), 200

    except Exception as e:
        if conn: conn.rollback()
        print(f"Update Profile Error: {e}")
        # Return the actual error message for debugging
        return jsonify({"error": str(e)}), 500
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()
