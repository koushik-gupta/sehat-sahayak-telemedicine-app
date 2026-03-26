import os
import sys

# Add current directory to path so we can import app modules
sys.path.append(os.getcwd())

from app.db_utils import get_db_connection
from app import create_app

def apply_fixes():
    app = create_app()
    with app.app_context():
        print("Connecting to database...")
        conn = get_db_connection()
        if not conn:
            print("Failed to connect to database.")
            return

        cursor = conn.cursor()

    try:
        # 1. Add 'gender' column to 'users' table if missing
        print("Checking for 'gender' column in 'users' table...")
        cursor.execute("SHOW COLUMNS FROM users LIKE 'gender'")
        if not cursor.fetchone():
            print("Adding 'gender' column...")
            cursor.execute("ALTER TABLE users ADD COLUMN gender VARCHAR(20) DEFAULT 'Other'")
            print("Column added.")
        else:
            print("'gender' column already exists.")

        # 2. Create 'doctor_availability' table
        print("Creating 'doctor_availability' table...")
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS doctor_availability (
            id INT AUTO_INCREMENT PRIMARY KEY,
            doctor_id INT NOT NULL,
            day_of_week VARCHAR(15) NOT NULL,
            start_time TIME NOT NULL,
            end_time TIME NOT NULL,
            is_available BOOLEAN DEFAULT TRUE,
            FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY `unique_schedule` (`doctor_id`, `day_of_week`)
        )
        """)

        # 3. Create 'prescriptions' table
        print("Creating 'prescriptions' table...")
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS prescriptions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            appointment_id INT NULL,
            patient_id INT NOT NULL,
            doctor_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            notes TEXT,
            FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
        )
        """)

        # 4. Create 'prescription_items' table
        print("Creating 'prescription_items' table...")
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS prescription_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            prescription_id INT NOT NULL,
            medicine_name VARCHAR(255) NOT NULL,
            dosage VARCHAR(100),
            frequency VARCHAR(100),
            duration VARCHAR(100),
            instructions TEXT,
            FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
        )
        """)

        # 5. Populate Mock Data (Availability)
        # Only if empty to avoid duplicates if rerun (though we have unique constraints)
        print("Populating mock availability...")
        # We use INSERT IGNORE to skip if duplicate key
        
        # Dr. Sarah (Cardio)
        current_email = 'sarah.cardio@test.com'
        cursor.execute("SELECT id FROM users WHERE email = %s", (current_email,))
        user = cursor.fetchone()
        if user:
            doc_id = user[0]
            schedules = [
                ('Monday', '09:00:00', '17:00:00'),
                ('Wednesday', '09:00:00', '17:00:00'),
                ('Friday', '09:00:00', '14:00:00')
            ]
            for day, start, end in schedules:
                try:
                    cursor.execute("""
                        INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, is_available)
                        VALUES (%s, %s, %s, %s, TRUE)
                        ON DUPLICATE KEY UPDATE start_time = VALUES(start_time), end_time = VALUES(end_time)
                    """, (doc_id, day, start, end))
                except Exception as e:
                    print(f"Error inserting schedule for {current_email}: {e}")

        # Dr. Rajesh (Derma)
        current_email = 'raj.derma@test.com'
        cursor.execute("SELECT id FROM users WHERE email = %s", (current_email,))
        user = cursor.fetchone()
        if user:
            doc_id = user[0]
            schedules = [
                ('Tuesday', '10:00:00', '18:00:00'),
                ('Thursday', '10:00:00', '18:00:00')
            ]
            for day, start, end in schedules:
                try:
                    cursor.execute("""
                        INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, is_available)
                        VALUES (%s, %s, %s, %s, TRUE)
                        ON DUPLICATE KEY UPDATE start_time = VALUES(start_time), end_time = VALUES(end_time)
                    """, (doc_id, day, start, end))
                except Exception as e:
                    print(f"Error inserting schedule for {current_email}: {e}")

        conn.commit()
        print("Database fixes applied successfully!")

    except Exception as e:
        conn.rollback()
        print(f"Error applying fixes: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    apply_fixes()
