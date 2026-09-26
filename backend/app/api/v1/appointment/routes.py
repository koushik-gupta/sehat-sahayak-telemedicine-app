# app/api/v1/appointment/routes.py

import os
import time
import secrets
import traceback
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


def _to_isoformat(value):
    parsed = _parse_datetime(value)
    return parsed.isoformat() if parsed else value


def _is_within_cancel_window(value):
    parsed = _parse_datetime(value)
    if not parsed:
        return False

    grace_window = timedelta(minutes=30)
    return parsed >= datetime.now() - grace_window

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
            cursor.execute("""
        SELECT day_of_week, start_time, end_time, is_available
        FROM doctor_availability
        WHERE doctor_id = %s
        ORDER BY id
    """, (doctor['id'],))

        doctor['availability'] = cursor.fetchall()
        
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
    reason = (data.get('reason') or '').strip()

    if not doctor_id:
        return jsonify({"error": "Doctor ID is required"}), 400

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT u.id, u.full_name, COALESCE(dp.specialty, d.specialization) AS specialty, dp.hospital
            FROM users u
            JOIN doctors d ON u.id = d.user_id
            LEFT JOIN doctor_profiles dp ON u.id = dp.user_id
            WHERE u.id = %s AND u.role = 'doctor' AND u.status IN ('active', 'approved')
        """, (doctor_id,))
        doctor = cursor.fetchone()
        if not doctor:
            return jsonify({"error": "Doctor not found"}), 404

        # --- SCHEDULED APPOINTMENT ---
        appointment_datetime_str = data.get('appointmentDatetime')

        if not appointment_datetime_str:
         return jsonify({"error": "Appointment date and time are required"}), 400

        try:
            appointment_datetime_obj = _parse_datetime(appointment_datetime_str)

            if not appointment_datetime_obj:
                raise ValueError("Invalid appointment date/time")

            if appointment_datetime_obj <= datetime.now():
                return jsonify({
                    "error": "Appointment date and time must be in the future"
                }), 400

        except (ValueError, TypeError):
            return jsonify({
                "error": "Invalid appointment date and time"
            }), 400
                # --- VERIFY DOCTOR AVAILABILITY ---
        requested_day = appointment_datetime_obj.strftime("%A")
        requested_time = appointment_datetime_obj.strftime("%H:%M:%S")

        cursor.execute("""
            SELECT start_time, end_time, is_available
            FROM doctor_availability
            WHERE doctor_id = %s
              AND day_of_week = %s
              AND is_available = 1
        """, (doctor_id, requested_day))

        availability = cursor.fetchone()

        if not availability:
            return jsonify({
                "error": f"Doctor is not available on {requested_day}."
            }), 400

        start_time = str(availability["start_time"])[:8]
        end_time = str(availability["end_time"])[:8]

        if not (start_time <= requested_time < end_time):
            return jsonify({
                "error": (
                    f"Doctor is available on {requested_day} "
                    f"only between {start_time[:5]} and {end_time[:5]}."
                )
            }), 400
                # --- PREVENT DOUBLE BOOKING ---
        cursor.execute("""
            SELECT id
            FROM appointments
            WHERE doctor_id = %s
              AND appointment_datetime = %s
              AND status IN ('pending', 'approved', 'scheduled')
        """, (doctor_id, appointment_datetime_str))

        existing_appointment = cursor.fetchone()

        if existing_appointment:
            return jsonify({
                "error": "This time slot has already been booked. Please choose another time."
            }), 409
        video_room_code = secrets.token_hex(16)

        query = """
            INSERT INTO appointments
            (patient_id, doctor_id, appointment_datetime, reason, video_room_code, status)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
        """


        cursor.execute(
        query,
        (
            current_user['id'],
            doctor_id,
            appointment_datetime_str,
            reason,
            video_room_code,
            'pending',
        )
    )

        appointment_id = cursor.fetchone()["id"]

        conn.commit()
        # Fetch details for the notification message
        cursor.execute("SELECT email, mobile, full_name FROM users WHERE id = %s", (current_user['id'],))
        patient = cursor.fetchone()
        
        # Format the time nicely for the user
        formatted_time = appointment_datetime_obj.strftime("%I:%M %p on %B %d, %Y")
        
        subject = "Your SwasthyaSetu Consultation Starts Shortly!"
        body = f"Hi {patient['full_name']},\n\nYour instant consultation with Dr. {doctor['full_name']} is confirmed.\n\nYou are in the queue and expected to join by: {formatted_time}\n\nYour secure video call code is: {video_room_code}\n\nPlease join the call from your dashboard."
        
        if patient.get('email'): send_email(patient['email'], subject, body)
        if patient.get('mobile'): send_sms(patient['mobile'], body)

        return jsonify({
            "message": "Appointment booked successfully!",
            "appointment": {
                "id": appointment_id,
                "doctor_name": doctor['full_name'],
                "specialty": doctor.get('specialty'),
                "hospital": doctor.get('hospital'),
                "appointment_datetime": appointment_datetime_obj.isoformat(),
                "status": "pending",
                "video_room_code": video_room_code,
                "reason": reason,
            },
            "roomCode": video_room_code
        }), 201

    except Exception as e:

      if conn:
        conn.rollback()

      print(f"Error booking appointment: {e}")

      traceback.print_exc()

      return jsonify({"error": "An internal server error occurred"}), 500
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
            SELECT a.id,
                   a.appointment_datetime,
                   a.created_at,
                   a.status,
                   a.reason,
                   a.video_room_code,
                   u.full_name as doctor_name,
                   COALESCE(dp.specialty, d.specialization) as specialty,
                   dp.hospital,
                   dp.fee,
                   dp.profile_pic_url as image
            FROM appointments a
            JOIN users u ON a.doctor_id = u.id
            JOIN doctors d ON a.doctor_id = d.user_id
            LEFT JOIN doctor_profiles dp ON a.doctor_id = dp.user_id
            WHERE a.patient_id = %s ORDER BY a.appointment_datetime ASC;
            """
        elif current_user['role'] == 'doctor':
            query = """
            SELECT a.id,
                   a.appointment_datetime,
                   a.created_at,
                   a.status,
                   a.reason,
                   a.video_room_code,
                   u.full_name as patient_name
            FROM appointments a JOIN users u ON a.patient_id = u.id
            WHERE a.doctor_id = %s ORDER BY a.appointment_datetime ASC;
            """
        else: return jsonify([]), 200
        
        cursor.execute(query, (current_user['id'],))
        appointments = cursor.fetchall()
        for apt in appointments:
            parsed_datetime = _parse_datetime(apt.get('appointment_datetime'))
            apt['appointment_datetime'] = parsed_datetime.isoformat() if parsed_datetime else apt.get('appointment_datetime')
            apt['created_at'] = _to_isoformat(apt.get('created_at'))
            if current_user['role'] == 'patient':
                apt['image'] = apt.get('image') or '/images/doc1.png'
                apt['can_cancel'] = bool(
                    (apt.get('status') or '').lower() == 'scheduled' and _is_within_cancel_window(apt.get('appointment_datetime'))
                )
        return jsonify(appointments), 200
    except Exception as e:
        print(f"Error fetching appointments: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


@appointment_bp.route('/<int:appointment_id>/cancel', methods=['POST'])
@login_required
def cancel_appointment(current_user, appointment_id):
    if current_user['role'] != 'patient':
        return jsonify({"error": "Only patients can cancel appointments"}), 403

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, appointment_datetime, status
            FROM appointments
            WHERE id = %s AND patient_id = %s
        """, (appointment_id, current_user['id']))
        appointment = cursor.fetchone()

        if not appointment:
            return jsonify({"error": "Appointment not found"}), 404

        status = (appointment.get('status') or '').lower()
        if status == 'cancelled':
            return jsonify({"error": "Appointment is already cancelled"}), 400

        if not _is_within_cancel_window(appointment.get('appointment_datetime')):
            return jsonify({"error": "This appointment can no longer be cancelled"}), 400

        cursor.execute(
            "UPDATE appointments SET status = 'cancelled' WHERE id = %s AND patient_id = %s",
            (appointment_id, current_user['id'])
        )
        conn.commit()
        return jsonify({"message": "Appointment cancelled successfully"}), 200
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error cancelling appointment: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

@appointment_bp.route('/<int:appointment_id>/complete', methods=['POST'])
@login_required
def complete_appointment(current_user, appointment_id):
    if current_user['role'] not in ('patient', 'doctor'):
        return jsonify({"error": "Unauthorized"}), 403

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT id, patient_id, doctor_id, status
            FROM appointments
            WHERE id = %s
        """, (appointment_id,))

        appointment = cursor.fetchone()

        if not appointment:
            return jsonify({"error": "Appointment not found"}), 404

        # Only the patient or doctor belonging to this appointment can complete it
        if current_user['id'] not in (
            appointment['patient_id'],
            appointment['doctor_id']
        ):
            return jsonify({"error": "Unauthorized"}), 403

        if appointment['status'] == 'completed':
            return jsonify({"message": "Appointment is already completed"}), 200

        if appointment['status'] == 'cancelled':
            return jsonify({"error": "Cancelled appointments cannot be completed"}), 400

        cursor.execute("""
            UPDATE appointments
            SET status = 'completed'
            WHERE id = %s
        """, (appointment_id,))

        conn.commit()

        return jsonify({
            "message": "Appointment completed successfully",
            "status": "completed"
        }), 200

    except Exception as e:
        if conn:
            conn.rollback()

        print(f"Error completing appointment: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500

    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()
@appointment_bp.route('/<int:appointment_id>/approve', methods=['POST'])
@login_required
def approve_appointment(current_user, appointment_id):
    if current_user['role'] != 'doctor':
        return jsonify({"error": "Only doctors can approve appointments"}), 403

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT id, patient_id, doctor_id, status
            FROM appointments
            WHERE id = %s
        """, (appointment_id,))

        appointment = cursor.fetchone()

        if not appointment:
            return jsonify({"error": "Appointment not found"}), 404

        if appointment['doctor_id'] != current_user['id']:
            return jsonify({"error": "You are not authorized to approve this appointment"}), 403

        if appointment['status'] != 'pending':
            return jsonify({
                "error": f"Appointment cannot be approved because its status is '{appointment['status']}'."
            }), 400

        cursor.execute("""
            UPDATE appointments
            SET status = 'approved'
            WHERE id = %s
        """, (appointment_id,))

        conn.commit()

        return jsonify({
            "message": "Appointment approved successfully",
            "status": "approved"
        }), 200

    except Exception as e:
        if conn:
            conn.rollback()

        print(f"Error approving appointment: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500

    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


@appointment_bp.route('/<int:appointment_id>/reject', methods=['POST'])
@login_required
def reject_appointment(current_user, appointment_id):
    if current_user['role'] != 'doctor':
        return jsonify({"error": "Only doctors can reject appointments"}), 403

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT id, patient_id, doctor_id, status
            FROM appointments
            WHERE id = %s
        """, (appointment_id,))

        appointment = cursor.fetchone()

        if not appointment:
            return jsonify({"error": "Appointment not found"}), 404

        if appointment['doctor_id'] != current_user['id']:
            return jsonify({"error": "You are not authorized to reject this appointment"}), 403

        if appointment['status'] != 'pending':
            return jsonify({
                "error": f"Appointment cannot be rejected because its status is '{appointment['status']}'."
            }), 400

        cursor.execute("""
            UPDATE appointments
            SET status = 'rejected'
            WHERE id = %s
        """, (appointment_id,))

        conn.commit()

        return jsonify({
            "message": "Appointment rejected successfully",
            "status": "rejected"
        }), 200

    except Exception as e:
        if conn:
            conn.rollback()

        print(f"Error rejecting appointment: {e}")
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
