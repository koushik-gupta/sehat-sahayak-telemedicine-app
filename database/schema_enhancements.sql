-- schema_enhancements.sql

-- 0. Add Gender to Users Table (if missing)
-- Procedure to add column safely
DROP PROCEDURE IF EXISTS AddGenderColumn;
DELIMITER //
CREATE PROCEDURE AddGenderColumn()
BEGIN
    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = 'telemedicine_db' 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'gender'
    ) THEN
        ALTER TABLE users ADD COLUMN gender VARCHAR(20) DEFAULT 'Other';
    END IF;
END //
DELIMITER ;
CALL AddGenderColumn();
DROP PROCEDURE AddGenderColumn;


-- 1. Create Availability Table
CREATE TABLE IF NOT EXISTS doctor_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    day_of_week VARCHAR(15) NOT NULL, -- Monday, Tuesday...
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY `unique_schedule` (`doctor_id`, `day_of_week`)
);

-- 2. Create Prescriptions Tables
CREATE TABLE IF NOT EXISTS prescriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NULL, -- Optional link to appointment
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
    -- FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL -- optional
);

CREATE TABLE IF NOT EXISTS prescription_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prescription_id INT NOT NULL,
    medicine_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    instructions TEXT,
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
);

-- 3. Mock Data for Mock Doctors ("Dr. Sarah Khan", "Dr. Rajesh...", etc.)

-- Dr. Sarah (Cardio) - Mon/Wed/Fri 9-5
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, is_available)
SELECT id, 'Monday', '09:00:00', '17:00:00', TRUE FROM users WHERE email='sarah.cardio@test.com'
ON DUPLICATE KEY UPDATE start_time='09:00:00';

INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, is_available)
SELECT id, 'Wednesday', '09:00:00', '17:00:00', TRUE FROM users WHERE email='sarah.cardio@test.com'
ON DUPLICATE KEY UPDATE start_time='09:00:00';

INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, is_available)
SELECT id, 'Friday', '09:00:00', '14:00:00', TRUE FROM users WHERE email='sarah.cardio@test.com'
ON DUPLICATE KEY UPDATE start_time='09:00:00';

-- Dr. Rajesh (Derma) - Tue/Thu 10-6
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, is_available)
SELECT id, 'Tuesday', '10:00:00', '18:00:00', TRUE FROM users WHERE email='raj.derma@test.com'
ON DUPLICATE KEY UPDATE start_time='10:00:00';

INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, is_available)
SELECT id, 'Thursday', '10:00:00', '18:00:00', TRUE FROM users WHERE email='raj.derma@test.com'
ON DUPLICATE KEY UPDATE start_time='10:00:00';


-- Mock Prescriptions (Linked to existing patients if any, or just generic for demo)
-- identifying 'Rahul Sharma' (patient@test.com) for linking
SET @patient_id = (SELECT id FROM users WHERE email='patient@test.com' LIMIT 1);
SET @doctor_id = (SELECT id FROM users WHERE email='sarah.cardio@test.com' LIMIT 1);

-- Only insert if both exist
INSERT INTO prescriptions (patient_id, doctor_id, notes, created_at)
SELECT @patient_id, @doctor_id, 'Mild hypertension detected. Recommended lifestyle changes.', NOW()
FROM DUAL WHERE @patient_id IS NOT NULL AND @doctor_id IS NOT NULL;

SET @last_prescription_id = LAST_INSERT_ID();

INSERT INTO prescription_items (prescription_id, medicine_name, dosage, frequency, duration, instructions)
SELECT @last_prescription_id, 'Amlodipine', '5mg', '1-0-0', '30 days', 'After breakfast'
FROM DUAL WHERE @last_prescription_id > 0;

INSERT INTO prescription_items (prescription_id, medicine_name, dosage, frequency, duration, instructions)
SELECT @last_prescription_id, 'Atorvastatin', '10mg', '0-0-1', '30 days', 'After dinner'
FROM DUAL WHERE @last_prescription_id > 0;
