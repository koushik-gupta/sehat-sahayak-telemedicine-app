from flask import Blueprint, request, jsonify
from app.db_utils import get_db_connection
from app.api.v1.auth.utils import login_required
import os
from werkzeug.utils import secure_filename
from app.file_utils import build_public_upload_url, get_upload_folder, relative_upload_url

doctor_bp = Blueprint('doctor_bp', __name__, url_prefix='/api/v1/doctor')

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- NEW: Endpoint for a doctor to upload their profile picture ---
@doctor_bp.route('/upload-picture', methods=['POST'])
@login_required
def upload_profile_picture(current_user):
    if current_user['role'] != 'doctor':
        return jsonify({"error": "Unauthorized"}), 403

    if 'profile_pic' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['profile_pic']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if file and allowed_file(file.filename):
        # Create a secure, unique filename to prevent conflicts
        filename = secure_filename(f"user_{current_user['id']}_{file.filename}")
        
        # Ensure the uploads directory exists
        upload_folder = get_upload_folder()
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)
        
        # The URL that the frontend will use to access the image
        file_url = relative_upload_url(filename) 
        
        # Now, save this URL to the doctor's profile in the database
        conn = get_db_connection()
        if not conn: return jsonify({"error": "Database connection failed"}), 500
        cursor = conn.cursor()
        try:
            # Ensure a doctor_profile row exists before updating
            cursor.execute("INSERT INTO doctor_profiles (user_id) VALUES (%s) ON DUPLICATE KEY UPDATE user_id=user_id", (current_user['id'],))
            
            cursor.execute(
                "UPDATE doctor_profiles SET profile_pic_url = %s WHERE user_id = %s",
                (file_url, current_user['id'])
            )
            conn.commit()
            return jsonify({"message": "Profile picture updated successfully", "url": build_public_upload_url(filename)}), 200
        except Exception as e:
            conn.rollback()
            print(f"Error updating profile picture URL: {e}")
            return jsonify({"error": "Failed to save picture URL to database"}), 500
        finally:
            cursor.close()
            conn.close()

    return jsonify({"error": "File type not allowed"}), 400


# --- UPDATED: Endpoint for patients to get the doctor list ---
@doctor_bp.route('/list', methods=['GET'])
def get_approved_doctors():
    conn = get_db_connection()
    if not conn: return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor(dictionary=True)
    try:
        # --- THIS IS THE CORRECTED QUERY ---
        # The CONCAT function has been removed as it's not needed for a single string.
        # This now correctly sends a hardcoded image path for all doctors.
        query = """
            SELECT 
                u.id,
                u.full_name as name,
                d.specialization as specialty,
                dp.experience,
                dp.languages,
                dp.fee,
                dp.hospital,
                '/images/doc1.png' as pic,
                '4.5' as rating
            FROM users u
            JOIN doctors d ON u.id = d.user_id
            LEFT JOIN doctor_profiles dp ON u.id = dp.user_id
            WHERE u.role = 'doctor' AND u.status IN ('active', 'approved')
        """
        cursor.execute(query)
        doctors = cursor.fetchall()
        return jsonify(doctors), 200
    except Exception as e:
        print(f"Error in get_approved_doctors: {e}")
        return jsonify({"error": "An internal error occurred"}), 500
    finally:
        cursor.close()
        conn.close()

# --- Endpoint for doctors to update their profile (Unchanged) ---
@doctor_bp.route('/profile', methods=['POST'])
@login_required
def update_doctor_profile(current_user):
    if current_user['role'] != 'doctor': return jsonify({"error": "Unauthorized"}), 403
    data = request.get_json()
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 1. Update doctor_profiles table (Extended details)
        profile_query = """
        INSERT INTO doctor_profiles (user_id, qualification, specialty, experience, about, languages, fee, hospital)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            qualification = VALUES(qualification), specialty = VALUES(specialty), experience = VALUES(experience),
            about = VALUES(about), languages = VALUES(languages), fee = VALUES(fee), hospital = VALUES(hospital);
        """
        profile_values = (
            current_user['id'], data.get('qualification'), data.get('specialty'), data.get('experience'),
            data.get('about'), ",".join(data.get('languages', [])), data.get('fee'), data.get('hospital')
        )
        cursor.execute(profile_query, profile_values)
        
        # 2. Update doctors table (Core & New Fields)
        # Updates clinic details and registration number in the main doctors table
        doctor_update_query = """
            UPDATE doctors 
            SET specialization = %s,
                clinic_name = COALESCE(%s, clinic_name),
                clinic_address = COALESCE(%s, clinic_address),
                registration_number = COALESCE(%s, registration_number)
            WHERE user_id = %s
        """
        cursor.execute(doctor_update_query, (
            data.get('specialty'), 
            data.get('clinic_name'), 
            data.get('clinic_address'), 
            data.get('registration_number'), 
            current_user['id']
        ))
        
        conn.commit()
        return jsonify({"message": "Profile updated successfully"}), 200
    except Exception as e:
        if conn: conn.rollback()
        print(f"Error updating doctor profile: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


# --- NEW: Endpoint to get recent patients for the doctor ---
@doctor_bp.route('/recent-patients', methods=['GET'])
@login_required
def get_recent_patients(current_user):
    if current_user['role'] != 'doctor': return jsonify({"error": "Unauthorized"}), 403
    
    conn = get_db_connection()
    if not conn: return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor(dictionary=True)
    try:
        # Fetch patients who have appointments with this doctor
        # ordered by most recent appointment
        query = """
            SELECT DISTINCT
                u.id, 
                u.full_name as name,
                'Follow-up' as type, -- Placeholder, logic can be improved
                DATE_FORMAT(a.appointment_datetime, '%Y-%m-%d %H:%i') as date,
                'Active' as status,
                (SELECT notes FROM appointments WHERE patient_id = u.id AND doctor_id = %s ORDER BY appointment_datetime DESC LIMIT 1) as details
            FROM appointments a
            JOIN users u ON a.patient_id = u.id
            WHERE a.doctor_id = %s
            ORDER BY a.appointment_datetime DESC
            LIMIT 10
        """
        cursor.execute(query, (current_user['id'], current_user['id']))
        patients = cursor.fetchall()
        
        # If no real patients found, return empty list (frontend handles empty state)
        if not patients:
             # Just for demo purposes if DB is empty, preserving the structure
             # In production, just return []
             pass

        return jsonify(patients), 200
    except Exception as e:
        print(f"Error fetching recent patients: {e}")
        return jsonify({"error": "Failed to fetch patients"}), 500
    finally:
        cursor.close()
        conn.close()

# --- NEW: Endpoint to get full patient details including history ---
@doctor_bp.route('/patients/<int:patient_id>', methods=['GET'])
@login_required
def get_patient_details(current_user, patient_id):
    if current_user['role'] != 'doctor': return jsonify({"error": "Unauthorized"}), 403

    conn = get_db_connection()
    if not conn: return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor(dictionary=True)
    try:
        # 1. Fetch Basic Info
        user_query = "SELECT id, full_name, email, phone_number, gender, date_of_birth FROM users WHERE id = %s"
        cursor.execute(user_query, (patient_id,))
        patient = cursor.fetchone()
        
        if not patient:
            return jsonify({"error": "Patient not found"}), 404

        # 2. Fetch Medical History (Consultations/Appointments with this doctor)
        history_query = """
            SELECT 
                id, 
                appointment_datetime, 
                status, 
                notes, 
                prescription_text 
            FROM appointments 
            WHERE patient_id = %s AND doctor_id = %s 
            ORDER BY appointment_datetime DESC
        """
        cursor.execute(history_query, (patient_id, current_user['id']))
        history = cursor.fetchall()
        
        # 3. Fetch Prescriptions (if stored in a separate table, otherwise using appointments.prescription_text)
        # Assuming current schema stores simple text in appointments or we need to join a 'prescriptions' table if it exists.
        # Based on previous tasks, there isn't a dedicated complex prescriptions table yet in the schema provided, 
        # so we will simulate it from appointment notes/prescription_text
        
        response_data = {
            "id": patient['id'],
            "name": patient['full_name'],
            "email": patient['email'],
            "phone": patient['phone_number'],
            "gender": patient['gender'],
            "dob": str(patient['date_of_birth']) if patient['date_of_birth'] else None,
            "history": history
        }
        
        return jsonify(response_data), 200

    except Exception as e:
        print(f"Error fetching patient details: {e}")
        return jsonify({"error": "Failed to fetch patient details"}), 500
        cursor.close()
        conn.close()

# --- NEW: Availability Management Endpoints ---

@doctor_bp.route('/availability', methods=['GET'])
@login_required
def get_availability(current_user):
    if current_user['role'] != 'doctor': return jsonify({"error": "Unauthorized"}), 403
    
    conn = get_db_connection()
    if not conn: return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor(dictionary=True)
    try:
        # Cursor dictionary=True returns values as they are converted by connector
        # For TIME columns, mysql-connector often returns timedelta. logic needs handling.
        # Safest is to handle query with CAST or process in python.
        
        cursor.execute("""
            SELECT 
                doctor_id, 
                day_of_week, 
                CAST(start_time AS CHAR) as start_time, 
                CAST(end_time AS CHAR) as end_time, 
                is_available 
            FROM doctor_availability 
            WHERE doctor_id = %s
        """, (current_user['id'],))
        schedule = cursor.fetchall()
        return jsonify(schedule), 200
    except Exception as e:
        print(f"Error fetching availability: {e}")
        return jsonify({"error": "Failed to fetch schedule"}), 500
    finally:
        cursor.close()
        conn.close()

@doctor_bp.route('/availability', methods=['POST'])
@login_required
def update_availability(current_user):
    if current_user['role'] != 'doctor': return jsonify({"error": "Unauthorized"}), 403
    
    data = request.get_json()
    # Expecting data list: [{day_of_week, start_time, end_time, is_available}, ...]
    
    conn = get_db_connection()
    if not conn: return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor()
    try:
        # We replace the entire schedule or upsert
        # Simplest approach: Delete existing for this doctor and re-insert
        cursor.execute("DELETE FROM doctor_availability WHERE doctor_id = %s", (current_user['id'],))
        
        insert_query = """
            INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, is_available)
            VALUES (%s, %s, %s, %s, %s)
        """
        for slot in data:
            cursor.execute(insert_query, (
                current_user['id'], 
                slot['day'], 
                slot['start'], 
                slot['end'], 
                slot.get('enabled', True)
            ))
            
        conn.commit()
        return jsonify({"message": "Schedule updated successfully"}), 200
    except Exception as e:
        conn.rollback()
        print(f"Error updating availability: {e}")
        return jsonify({"error": "Failed to update schedule"}), 500
    finally:
        cursor.close()
        conn.close()


# --- NEW: Structured Prescription Endpoints ---

@doctor_bp.route('/prescriptions', methods=['GET', 'POST'])
@login_required
def handle_prescriptions(current_user):
    if current_user['role'] != 'doctor': return jsonify({"error": "Unauthorized"}), 403
    
    conn = get_db_connection()
    if not conn: return jsonify({"error": "Database connection failed"}), 500
    
    if request.method == 'GET':
        cursor = conn.cursor(dictionary=True)
        try:
            # Fetch prescriptions issued by this doctor
            query = """
                SELECT 
                    p.id, 
                    u.full_name as patient, 
                    DATE_FORMAT(p.created_at, '%b %d, %Y') as date,
                    (SELECT GROUP_CONCAT(CONCAT(medicine_name, ' ', dosage) SEPARATOR ', ') 
                     FROM prescription_items WHERE prescription_id = p.id) as meds,
                    p.notes
                FROM prescriptions p
                JOIN users u ON p.patient_id = u.id
                WHERE p.doctor_id = %s
                ORDER BY p.created_at DESC
            """
            cursor.execute(query, (current_user['id'],))
            prescriptions = cursor.fetchall()
            return jsonify(prescriptions), 200
        except Exception as e:
            print(f"Error fetching prescriptions: {e}")
            return jsonify({"error": "Failed to fetch prescriptions"}), 500
        finally:
            cursor.close()
            conn.close()

    elif request.method == 'POST':
        # ... (Existing POST logic) ...
        data = request.get_json()
        cursor = conn.cursor()
        try:
            # 1. Create Prescription Header
            cursor.execute("""
                INSERT INTO prescriptions (patient_id, doctor_id, appointment_id, notes)
                VALUES (%s, %s, %s, %s)
            """, (data['patient_id'], current_user['id'], data.get('appointment_id'), data.get('notes')))
            
            prescription_id = cursor.lastrowid
            
            # 2. Insert Medicine Items
            item_query = """
                INSERT INTO prescription_items (prescription_id, medicine_name, dosage, frequency, duration, instructions)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            for med in data.get('medicines', []):
                cursor.execute(item_query, (
                    prescription_id,
                    med['name'],
                    med['dosage'],
                    med['frequency'],
                    med['duration'],
                    med['instructions']
                ))
                
            conn.commit()
            return jsonify({"message": "Prescription created successfully", "id": prescription_id}), 201
        except Exception as e:
            conn.rollback()
            print(f"Error creating prescription: {e}")
            return jsonify({"error": "Failed to create prescription"}), 500
        finally:
            cursor.close()
            conn.close()

@doctor_bp.route('/stats', methods=['GET'])
@login_required
def get_doctor_stats(current_user):
    if current_user['role'] != 'doctor': return jsonify({"error": "Unauthorized"}), 403
    
    conn = get_db_connection()
    if not conn: return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor(dictionary=True)
    try:
        # Mock analytics logic (can be replaced with real queries later)
        # 1. Total Patients
        cursor.execute("SELECT COUNT(DISTINCT patient_id) as count FROM appointments WHERE doctor_id = %s", (current_user['id'],))
        result = cursor.fetchone()
        total_patients = result['count'] if result else 0
        
        # 2. Appointments this month
        cursor.execute("""
            SELECT COUNT(*) as count FROM appointments 
            WHERE doctor_id = %s AND MONTH(appointment_datetime) = MONTH(CURRENT_DATE())
        """, (current_user['id'],))
        result_month = cursor.fetchone()
        appointments_month = result_month['count'] if result_month else 0
        
        # 3. Earnings (Mock calculation: completed appointments * fee)
        # We need the fee from profiles
        cursor.execute("SELECT fee FROM doctor_profiles WHERE user_id = %s", (current_user['id'],))
        profile = cursor.fetchone()
        
        # safely convert fee to float
        fee_val = 500 # default
        if profile and profile['fee']:
            try:
                fee_val = float(str(profile['fee']).replace(',', ''))
            except ValueError:
                fee_val = 500
        
        earnings = appointments_month * fee_val 
        
        # --- Chart Data ---
        
        # 4. Appointment Trends (Last 6 months)
        # Real logic: Group by Month
        # 4. Appointment Trends (Last 6 months)
        # Using MIN(appointment_datetime) to be compatible with ONLY_FULL_GROUP_BY
        cursor.execute("""
            SELECT DATE_FORMAT(MIN(appointment_datetime), '%b') as label, COUNT(*) as value
            FROM appointments
            WHERE doctor_id = %s AND appointment_datetime >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY YEAR(appointment_datetime), MONTH(appointment_datetime)
            ORDER BY MIN(appointment_datetime) ASC
        """, (current_user['id'],))
        trends_data = cursor.fetchall()
        
        # If no data (or very little), provide mock data for the demo accounts
        # We can detect demo accounts by email or just if data is empty
        if not trends_data and current_user['role'] == 'doctor':
             # Mock trends for demo experience
             trends_data = [
                 {'label': 'Aug', 'value': 12}, {'label': 'Sep', 'value': 19},
                 {'label': 'Oct', 'value': 15}, {'label': 'Nov', 'value': 25},
                 {'label': 'Dec', 'value': 32}, {'label': 'Jan', 'value': appointments_month or 28}
             ]

        # 5. Patient Demographics (Gender)
        cursor.execute("""
            SELECT u.gender as label, COUNT(DISTINCT u.id) as value
            FROM appointments a 
            JOIN users u ON a.patient_id = u.id
            WHERE a.doctor_id = %s
            GROUP BY u.gender
        """, (current_user['id'],))
        demographics_data = cursor.fetchall()
        
        # Fallback mock for demographics if empty
        if not demographics_data:
            demographics_data = [
                {'label': 'Male', 'value': 55}, 
                {'label': 'Female', 'value': 45}
            ]
        
        stats = {
            "total_patients": total_patients,
            "appointments_this_month": appointments_month,
            "total_earnings": earnings,
            "rating": 4.8,
            "charts": {
                "trends": trends_data,
                "demographics": demographics_data
            }
        }
        return jsonify(stats), 200
    except Exception as e:
        print(f"Error fetching stats: {e}")
        return jsonify({"error": "Failed to fetch stats"}), 500
    finally:
        cursor.close()
        conn.close()
