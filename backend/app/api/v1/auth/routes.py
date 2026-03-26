import random
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, session
from passlib.hash import pbkdf2_sha256 as sha256

from app.db_utils import get_db_connection
from app.email_utils import send_email
from app.sms_utils import send_sms
from app.file_utils import public_url_for_path

auth_bp = Blueprint('auth_v1', __name__, url_prefix='/api/v1/auth')


def _normalize_user_media(user):
    if not user:
        return user

    profile_picture = user.get('profile_picture')
    profile_pic_url = user.get('profile_pic_url')

    if profile_picture:
        user['profile_picture'] = public_url_for_path(profile_picture)
    elif profile_pic_url:
        user['profile_picture'] = public_url_for_path(profile_pic_url)

    if profile_pic_url:
        user['profile_pic_url'] = public_url_for_path(profile_pic_url)

    return user

@auth_bp.route('/register', methods=['POST'])
def register_user():
    # This function is correct and remains unchanged.
    conn = None
    try:
        data = request.get_json()
        role = data.get('role')
        full_name = data.get('name')
        email = data.get('email')
        mobile = data.get('mobile')
        password = data.get('password')

        if role == 'patient':
            otp_verified_data = session.get('otp_verified_data')
            identifier = mobile if mobile else email
            if not otp_verified_data or otp_verified_data.get('identifier') != identifier:
                return jsonify({"error": "Contact information has not been verified with OTP."}), 403
        
        password_hash = sha256.hash(password)

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        conn.start_transaction()

        if email:
            cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cursor.fetchone(): return jsonify({"error": "Email is already registered."}), 409
        if mobile:
            cursor.execute("SELECT id FROM users WHERE mobile = %s", (mobile,))
            if cursor.fetchone(): return jsonify({"error": "Mobile number is already registered."}), 409

        user_query = "INSERT INTO users (role, status, full_name, email, mobile, aadhar_number, password_hash) VALUES (%s, %s, %s, %s, %s, %s, %s)"
        # For doctors/pharmacies, the frontend should send 'pending_verification' as the status
        status = 'active' if role == 'patient' else data.get('status', 'pending_verification')
        user_values = (role, status, full_name, email, mobile, data.get('aadhar'), password_hash)
        cursor.execute(user_query, user_values)
        user_id = cursor.lastrowid

        if role == 'doctor':
            cursor.execute("INSERT INTO doctors (user_id, registration_number) VALUES (%s, %s)", (user_id, data.get('registrationNumber')))
        elif role == 'pharmacy':
            cursor.execute("INSERT INTO pharmacies (user_id, license_number, address) VALUES (%s, %s, %s)", (user_id, data.get('licenseNumber'), data.get('address')))
        elif role == 'patient':
            cursor.execute("INSERT INTO patients (user_id, full_name) VALUES (%s, %s)", (user_id, full_name))
        
        conn.commit()
        
        session.clear()
        session['user_id'] = user_id
        session['role'] = role
        session.pop('otp_verified_data', None)

        cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        new_user_data = cursor.fetchone()
        
        if new_user_data: del new_user_data['password_hash']
        
        return jsonify({ "message": f"User '{full_name}' registered successfully.", "user": new_user_data }), 201

    except Exception as e:
        if 'conn' in locals() and conn.is_connected(): conn.rollback()
        print(f"Registration Error: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@auth_bp.route('/login', methods=['POST'])
def login_user():
    """Handles user login with role-specific status checks."""
    try:
        data = request.get_json()
        password = data.get('password')
        email = data.get('email')
        mobile = data.get('mobile')
        role_from_request = data.get('role')

        if not password or not role_from_request or not (email or mobile):
            return jsonify({"error": "Identifier, password, and role are required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        if email:
            cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        else:
            cursor.execute("SELECT * FROM users WHERE mobile = %s", (mobile,))
        
        user = cursor.fetchone()

        if not user or not sha256.verify(password, user['password_hash']):
            return jsonify({"error": "Invalid credentials"}), 401
            
        if user['role'] != role_from_request:
            return jsonify({"error": f"Invalid credentials for the selected '{role_from_request}' role."}), 401

        # --- THIS IS THE FIX ---
        # Added a debug print and role-specific status checks.
        print(f"DEBUG: Login attempt for user {user['id']} ({user['full_name']}) with role '{user['role']}' and status '{user['status']}'")

        if user['role'] == 'patient':
            if user['status'] != 'active':
                return jsonify({"error": f"Your account is not active. Status: {user['status']}"}), 403
        elif user['role'] in ['doctor', 'pharmacy']:
            if user['status'] not in ['active', 'approved']:
                # This message is more helpful to the user
                return jsonify({"error": f"Your account has not been approved by an administrator yet. Status: {user['status']}"}), 403
        
        # You can add checks for other roles like 'admin' here if needed

        # --- NEW: Fetch Role-Specific Data ---
        if user['role'] == 'patient':
            cursor.execute("SELECT * FROM patients WHERE user_id = %s", (user['id'],))
            patient_data = cursor.fetchone()
            if patient_data:
                # Merge patient data into user object, avoiding ID conflict
                patient_data.pop('id', None)
                patient_data.pop('user_id', None)
                user.update(patient_data)
        elif user['role'] == 'doctor':
             cursor.execute("SELECT * FROM doctor_profiles WHERE user_id = %s", (user['id'],))
             doctor_data = cursor.fetchone()
             if doctor_data:
                 doctor_data.pop('user_id', None)
                 user.update(doctor_data)

        session.clear()
        session['user_id'] = user['id']
        session['role'] = user['role']
        
        del user['password_hash']
        _normalize_user_media(user)
        
        return jsonify({"message": "Login successful", "user": user}), 200

    except Exception as e:
        print(f"Login Error: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()


@auth_bp.route('/logout', methods=['POST'])
def logout_user():
    # This function is correct and remains unchanged.
    session.clear()
    return jsonify({"message": "Logout successful"}), 200


# The OTP and password reset routes are correct and remain unchanged.
@auth_bp.route('/send-otp', methods=['POST'])
def send_otp():
    # ... (code is unchanged)
    try:
        data = request.get_json()
        email = data.get('email')
        mobile = data.get('mobile')
        purpose = data.get('purpose', 'reset')
        if not (email or mobile) and purpose != 'update_profile': return jsonify({"error": "Email or mobile number is required"}), 400
        otp_code = str(random.randint(100000, 999999))
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        if purpose == 'register':
            if mobile:
                cursor.execute("SELECT id FROM users WHERE mobile = %s", (mobile,))
                if cursor.fetchone(): return jsonify({"error": "This mobile number is already registered."}), 409
            if email:
                cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
                if cursor.fetchone(): return jsonify({"error": "This email is already registered."}), 409
            session['pending_otp'] = { "otp": otp_code, "identifier": mobile if mobile else email, "expires_at": (datetime.utcnow() + timedelta(minutes=5)).timestamp() }
        elif purpose == 'update_profile':
            # For profile update, we must send OTP to the *current* verified contact.
            user_id = session.get('user_id')
            if not user_id: return jsonify({"error": "User not authenticated"}), 401
            
            cursor.execute("SELECT mobile, email FROM users WHERE id = %s", (user_id,))
            user = cursor.fetchone()
            if not user: return jsonify({"error": "User not found"}), 404
            
            # Smart Routing:
            # 1. If email exists in DB, use it (primary).
            # 2. Else if mobile exists in DB, use it (secondary/fallback).
            # The 'email' and 'mobile' variables here determine WHERE we send the OTP.
            
            db_email = user.get('email')
            db_mobile = user.get('mobile')

            # We need to decide which channel to use.
            # We set local variables 'email' and 'mobile' to direct the sending logic below.
            if db_email:
                email = db_email
                mobile = None # Ensure we don't double send or confuse the logic
            elif db_mobile:
                email = None
                mobile = db_mobile
            else:
                return jsonify({"error": "No verified contact method found on account."}), 400
            
            session['profile_update_otp'] = { 
                "otp": otp_code, 
                "expires_at": (datetime.utcnow() + timedelta(minutes=5)).timestamp() 
            }
        else:
            query = "UPDATE users SET otp = %s, otp_expires_at = %s WHERE " + ("email = %s" if email else "mobile = %s")
            values = (otp_code, datetime.utcnow() + timedelta(minutes=10), email if email else mobile)
            cursor.execute(query, values)
            if cursor.rowcount == 0: return jsonify({"error": "No account found"}), 404
            conn.commit()
            
        body = f"Hello,\n\nYour SwasthyaSetu verification code is: {otp_code}\n\nUse this code to verify your identity."
        
        # Send to the chosen channel
        if email:
            if not send_email(to_email=email, subject="Verify Identity", body=body): return jsonify({"error": "Failed to send OTP email."}), 500
            # Mask the email for privacy/security in the response
            masked_email = email[0:2] + "***" + email.split('@')[0][-2:] + "@" + email.split('@')[1] if '@' in email else email
            return jsonify({"message": f"Verification code sent to your registered email {masked_email}"}), 200
        elif mobile:
            if not send_sms(to_mobile=mobile, body=body): return jsonify({"error": "Failed to send OTP SMS."}), 500
             # Mask the mobile
            masked_mobile = mobile[-4:]
            return jsonify({"message": f"Verification code sent to your registered mobile ending in ****{masked_mobile}"}), 200
        else:
            return jsonify({"error": "No valid channel determined."}), 500
    except Exception as e:
        print(f"Send OTP Error: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    # ... (code is unchanged)
    conn = None
    try:
        data = request.get_json()
        otp_from_user = data.get('otp')
        purpose = data.get('purpose', 'reset')
        identifier = data.get('mobile') or data.get('email')
        if not otp_from_user: return jsonify({"error": "OTP is required"}), 400
        if not identifier and purpose != 'update_profile': return jsonify({"error": "Identifier is required"}), 400
        if purpose == 'register':
            pending_otp = session.get('pending_otp')
            if not pending_otp or datetime.utcnow().timestamp() > pending_otp.get('expires_at', 0) or pending_otp.get('identifier') != identifier:
                session.pop('pending_otp', None)
                return jsonify({"error": "OTP has expired or is invalid. Please request a new one."}), 410
            if pending_otp.get('otp') != otp_from_user: return jsonify({"error": "Invalid OTP code."}), 401
            session['otp_verified_data'] = session.pop('pending_otp')
            return jsonify({"message": "Verification successful."}), 200
        elif purpose == 'update_profile':
            pending_otp = session.get('profile_update_otp')
            if not pending_otp or datetime.utcnow().timestamp() > pending_otp.get('expires_at', 0):
                 session.pop('profile_update_otp', None)
                 return jsonify({"error": "OTP has expired. Please request a new one."}), 410
            
            if pending_otp.get('otp') != otp_from_user: return jsonify({"error": "Invalid OTP code."}), 401
            
            # Success! Set the verified flag
            session.pop('profile_update_otp', None)
            session['sensitive_update_verified'] = True
            return jsonify({"message": "Identity verified successfully. You can now update your profile."}), 200
            
        else:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            query = "SELECT otp, otp_expires_at FROM users WHERE " + ("email = %s" if data.get('email') else "mobile = %s")
            cursor.execute(query, (identifier,))
            user = cursor.fetchone()
            if not user: return jsonify({"error": "User not found"}), 404
            if user['otp'] != otp_from_user: return jsonify({"error": "Invalid OTP code"}), 401
            if user['otp_expires_at'] < datetime.utcnow(): return jsonify({"error": "OTP has expired."}), 410
            session['password_reset_allowed_for'] = identifier
            return jsonify({"message": "Verification successful. You can now reset your password."}), 200
    except Exception as e:
        print(f"Verify OTP Error: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    # ... (code is unchanged)
    try:
        data = request.get_json()
        new_password = data.get('newPassword')
        identifier = data.get('mobile') or data.get('email')
        if not new_password or not identifier: return jsonify({"error": "Identifier and new password are required"}), 400
        if session.get('password_reset_allowed_for') != identifier: return jsonify({"error": "Password reset not authorized. Please verify with OTP first."}), 403
        new_password_hash = sha256.hash(new_password)
        conn = get_db_connection()
        cursor = conn.cursor()
        query = "UPDATE users SET password_hash = %s, otp = NULL, otp_expires_at = NULL WHERE " + ("email = %s" if data.get('email') else "mobile = %s")
        cursor.execute(query, (new_password_hash, identifier))
        if cursor.rowcount == 0: return jsonify({"error": "User not found"}), 404
        conn.commit()
        session.pop('password_reset_allowed_for', None)
        return jsonify({"message": "Password has been reset successfully."}), 200
    except Exception as e:
        if 'conn' in locals() and conn.is_connected(): conn.rollback()
        print(f"Reset Password Error: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@auth_bp.route('/check-session', methods=['GET'])
def check_session():
    """
    Checks if a user is currently logged in and returns their details.
    RESTORES session state for the frontend on reload.
    """
    if 'user_id' not in session:
        return jsonify({"authenticated": False}), 200 # Not an error, just no session

    user_id = session['user_id']
    
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        
        if not user:
            session.clear()
            return jsonify({"authenticated": False}), 200

        # Fetch Role-Specific Data (Same logic as login)
        if user['role'] == 'patient':
            cursor.execute("SELECT * FROM patients WHERE user_id = %s", (user['id'],))
            patient_data = cursor.fetchone()
            if patient_data:
                patient_data.pop('id', None)
                patient_data.pop('user_id', None)
                user.update(patient_data)
        elif user['role'] == 'doctor':
             cursor.execute("SELECT * FROM doctor_profiles WHERE user_id = %s", (user['id'],))
             doctor_data = cursor.fetchone()
             if doctor_data:
                 doctor_data.pop('user_id', None)
                 user.update(doctor_data)
        
        # --- Statistics for Real-time Dashboard ---
        # Appointments
        try:
            if user['role'] == 'patient':
                # Assuming patients table links to appointments via patient_id, OR we use user_id directly if possible.
                # Safest to check existence of patient record first
                if 'id' in user: # This refers to patient_id if merged, or user_id. 
                    # user record currently has user_id (id=19). merged patient data might overwrite 'id' or not?
                    # check_session pops 'id' from patient_data. So 'id' is USER ID.
                    # We need patient_id.
                    
                    # Let's get patient_id again to be sure
                    cursor.execute("SELECT id FROM patients WHERE user_id = %s", (user_id,))
                    pat_res = cursor.fetchone()
                    if pat_res:
                        patient_id_for_appt = pat_res['id']
                        cursor.execute("SELECT COUNT(*) as count FROM appointments WHERE patient_id = %s", (patient_id_for_appt,))
                        user['appointments_count'] = cursor.fetchone()['count']
                    else:
                         user['appointments_count'] = 0
            elif user['role'] == 'doctor':
                # Doctor appointments check
                 cursor.execute("SELECT id FROM doctors WHERE user_id = %s", (user_id,))
                 doc_res = cursor.fetchone()
                 if doc_res:
                     doc_id = doc_res['id']
                     cursor.execute("SELECT COUNT(*) as count FROM appointments WHERE doctor_id = %s", (doc_id,))
                     user['appointments_count'] = cursor.fetchone()['count']
                 else:
                     user['appointments_count'] = 0
        except Exception as e:
            print(f"Stats Error (Appointments): {e}")
            user['appointments_count'] = 0

        # Prescriptions / Documents
        try:
            # For now, we map 'prescriptions' count to the number of uploaded documents/records
            cursor.execute("SELECT COUNT(*) as count FROM documents WHERE user_id = %s", (user_id,))
            user['prescriptions_count'] = cursor.fetchone()['count']
        except Exception as e:
            print(f"Stats Error (Documents): {e}")
            user['prescriptions_count'] = 0
        
        if 'password_hash' in user:
            del user['password_hash']
        _normalize_user_media(user)
            
        return jsonify({"authenticated": True, "user": user}), 200

    except Exception as e:
        print(f"Check Session Error: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

