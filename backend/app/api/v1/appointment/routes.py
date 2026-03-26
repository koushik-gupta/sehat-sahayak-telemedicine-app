# app/api/v1/appointment/routes.py

import os
import time
import secrets
from datetime import datetime, timedelta # Import datetime for time calculations
from flask import Blueprint, request, jsonify, current_app
from app.db_utils import get_db_connection
from app.email_utils import send_email
from app.sms_utils import send_sms
from app.api.v1.auth.utils import login_required
from app.file_utils import build_public_upload_url, get_upload_folder

# --- PDF and Translator Imports ---
from deep_translator import GoogleTranslator
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph
from reportlab.lib.styles import getSampleStyleSheet

appointment_bp = Blueprint('appointment_bp', __name__, url_prefix='/api/v1/appointment')


def _parse_datetime(value):
    if isinstance(value, datetime):
        return value
    if not value:
        return None

    text = str(value).replace('T', ' ')
    try:
        return datetime.fromisoformat(text)
    except ValueError:
        return None

# --- Doctor & Appointment Management ---

@appointment_bp.route('/doctors', methods=['GET'])
@login_required
def get_all_doctors(current_user):
    """
    Fetches a list of all real, active doctors who have completed their professional profiles.
    """
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
        SELECT 
            u.id, u.full_name as name,
            dp.specialty, dp.qualification, dp.experience, dp.about, dp.languages, dp.fee, dp.hospital
        FROM users u
        JOIN doctors d ON u.id = d.user_id
        INNER JOIN doctor_profiles dp ON u.id = dp.user_id 
        WHERE u.role = 'doctor' AND u.status IN ('active', 'approved');
        """
        cursor.execute(query)
        doctors = cursor.fetchall()
        
        for doctor in doctors:
            doctor['image'] = '/images/doc1.png'
            doctor['slots'] = ["10:00 AM", "11:30 AM", "4:00 PM", "6:00 PM"]
        
        return jsonify(doctors), 200

    except Exception as e:
        print(f"Error fetching doctors: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

@appointment_bp.route('/book', methods=['POST'])
@login_required
def book_appointment(current_user):
    """
    Handles INSTANT booking, calculates queue time, and sends a notification.
    """
    if current_user['role'] != 'patient':
        return jsonify({"error": "Only patients can book appointments"}), 403
    
    data = request.get_json()
    doctor_id = data.get('doctorId')

    if not doctor_id:
        return jsonify({"error": "Doctor ID is required"}), 400

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # --- INSTANT BOOKING & QUEUE LOGIC ---
        now = datetime.now()
        today_str = now.strftime("%Y-%m-%d")

        # 1. Find the last scheduled appointment for this doctor today.
        cursor.execute(
            "SELECT appointment_datetime FROM appointments WHERE doctor_id = %s AND DATE(appointment_datetime) = %s ORDER BY appointment_datetime DESC LIMIT 1",
            (doctor_id, today_str)
        )
        last_appointment = cursor.fetchone()

        # 2. Calculate the new appointment time.
        start_time = now
        last_appointment_time = _parse_datetime(last_appointment['appointment_datetime']) if last_appointment else None
        
        # If the last appointment is still in the future (meaning a queue has formed),
        # add 10 minutes to the last appointment's time.
        if last_appointment_time and last_appointment_time > now:
            start_time = last_appointment_time + timedelta(minutes=10)
        
        # If the last appointment is in the past or doesn't exist, the queue starts now.
        appointment_datetime_obj = start_time
        appointment_datetime_str = appointment_datetime_obj.strftime("%Y-%m-%d %H:%M:%S")
        # --- END OF LOGIC ---
        
        video_room_code = secrets.token_hex(16)
        query = "INSERT INTO appointments (patient_id, doctor_id, appointment_datetime, video_room_code) VALUES (%s, %s, %s, %s);"
        cursor.execute(query, (current_user['id'], doctor_id, appointment_datetime_str, video_room_code))
        conn.commit()

        # Fetch details for the notification message
        cursor.execute("SELECT email, mobile, full_name FROM users WHERE id = %s", (current_user['id'],))
        patient = cursor.fetchone()
        cursor.execute("SELECT full_name FROM users WHERE id = %s", (doctor_id,))
        doctor = cursor.fetchone()
        
        # Format the time nicely for the user
        formatted_time = appointment_datetime_obj.strftime("%I:%M %p on %B %d, %Y")
        
        subject = "Your SwasthyaSetu Consultation Starts Shortly!"
        body = f"Hi {patient['full_name']},\n\nYour instant consultation with Dr. {doctor['full_name']} is confirmed.\n\nYou are in the queue and expected to join by: {formatted_time}\n\nYour secure video call code is: {video_room_code}\n\nPlease join the call from your dashboard."
        
        if patient.get('email'): send_email(patient['email'], subject, body)
        if patient.get('mobile'): send_sms(patient['mobile'], body)

        return jsonify({"message": "Appointment booked successfully!", "roomCode": video_room_code}), 201

    except Exception as e:
        if conn: conn.rollback()
        print(f"Error booking appointment: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

@appointment_bp.route('/my-appointments', methods=['GET'])
@login_required
def get_my_appointments(current_user):
    """ Fetches appointments for the currently logged-in user. """
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        if current_user['role'] == 'patient':
            query = """
            SELECT a.id, a.appointment_datetime, a.status, a.video_room_code, u.full_name as doctor_name
            FROM appointments a JOIN users u ON a.doctor_id = u.id
            WHERE a.patient_id = %s ORDER BY a.appointment_datetime ASC;
            """
        elif current_user['role'] == 'doctor':
            query = """
            SELECT a.id, a.appointment_datetime, a.status, a.video_room_code, u.full_name as patient_name
            FROM appointments a JOIN users u ON a.patient_id = u.id
            WHERE a.doctor_id = %s ORDER BY a.appointment_datetime ASC;
            """
        else: return jsonify([]), 200
        
        cursor.execute(query, (current_user['id'],))
        appointments = cursor.fetchall()
        for apt in appointments:
            parsed_datetime = _parse_datetime(apt.get('appointment_datetime'))
            apt['appointment_datetime'] = parsed_datetime.isoformat() if parsed_datetime else apt.get('appointment_datetime')
        return jsonify(appointments), 200
    except Exception as e:
        print(f"Error fetching appointments: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

# --- Migrated Helper Endpoints (Unchanged) ---

@appointment_bp.route('/translate', methods=['POST'])
@login_required
def translate_text(current_user):
    payload = request.get_json()
    text, target = payload.get("text", ""), payload.get("target", "en")
    try:
        return jsonify({"translated_text": GoogleTranslator(source='auto', target=target).translate(text)})
    except Exception:
        return jsonify({"translated_text": text})

@appointment_bp.route('/upload', methods=['POST'])
@login_required
def upload_file(current_user):
    if 'file' not in request.files: return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '': return jsonify({"error": "No selected file"}), 400
    ts = int(time.time())
    safe_name = f"{ts}_{file.filename.replace(' ', '_')}"
    upload_dir = get_upload_folder()
    file_path = os.path.join(upload_dir, safe_name)
    file.save(file_path)
    return jsonify({"url": build_public_upload_url(safe_name)})

@appointment_bp.route('/generate_prescription', methods=['POST'])
@login_required
def generate_prescription(current_user):
    if current_user['role'] != 'doctor': return jsonify({"error": "Unauthorized"}), 403
    patient_name, doctor_name, prescription = request.form.get('patient_name'), request.form.get('doctor_name'), request.form.get('prescription')
    ts = int(time.time())
    safe_patient = patient_name.replace(" ", "_")
    pdf_filename = f"Prescription_{safe_patient}_{ts}.pdf"
    upload_dir = get_upload_folder()
    pdf_path = os.path.join(upload_dir, pdf_filename)
    c = canvas.Canvas(pdf_path, pagesize=letter)
    width, height = letter
    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(width / 2.0, height - inch, "Medical Prescription")
    styles = getSampleStyleSheet()
    p = Paragraph(prescription.replace("\n", "<br/>"), styles["Normal"])
    p.wrapOn(c, width - 2.5 * inch, height)
    p.drawOn(c, inch + 0.25 * inch, height - 5 * inch)
    c.save()
    return jsonify({"url": build_public_upload_url(pdf_filename)})
