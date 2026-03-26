-- Full Database Schema Dump (Consolidated)
-- Includes all tables, updates, seed data, and mock accounts

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET TIME_ZONE = "+00:00";
SET SQL_SAFE_UPDATES = 0;

-- --------------------------------------------------------
-- 1. Table Definitions
-- --------------------------------------------------------

-- Table: users
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('patient','doctor','admin','pharmacy') NOT NULL DEFAULT 'patient',
  `status` varchar(50) DEFAULT 'active',
  `aadhar_number` varchar(50) DEFAULT NULL,
  `otp` varchar(10) DEFAULT NULL,
  `otp_expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `profile_picture` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `mobile` (`mobile`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: patients
DROP TABLE IF EXISTS `patients`;
CREATE TABLE `patients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `address` text,
  `blood_group` varchar(10) DEFAULT NULL,
  `weight` varchar(10) DEFAULT NULL,
  `height` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `patients_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: doctors
DROP TABLE IF EXISTS `doctors`;
CREATE TABLE `doctors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `registration_number` varchar(100) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `clinic_name` varchar(255) DEFAULT NULL,
  `clinic_address` text,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `doctors_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: doctor_profiles
DROP TABLE IF EXISTS `doctor_profiles`;
CREATE TABLE `doctor_profiles` (
  `user_id` int NOT NULL,
  `qualification` varchar(255) DEFAULT NULL,
  `specialty` varchar(100) DEFAULT NULL,
  `experience` varchar(50) DEFAULT NULL,
  `about` text,
  `languages` varchar(255) DEFAULT NULL,
  `fee` decimal(10,2) DEFAULT NULL,
  `hospital` varchar(255) DEFAULT NULL,
  `profile_pic_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `doctor_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: appointments
DROP TABLE IF EXISTS `appointments`;
CREATE TABLE `appointments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `doctor_id` int NOT NULL,
  `appointment_datetime` datetime NOT NULL,
  `reason` text,
  `status` enum('scheduled','completed','cancelled') DEFAULT 'scheduled',
  `video_room_code` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `doctor_id` (`doctor_id`),
  CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: health_records
DROP TABLE IF EXISTS `health_records`;
CREATE TABLE `health_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `doctor_name` varchar(255) DEFAULT NULL,
  `record_type` varchar(100) NOT NULL,
  `record_date` date NOT NULL,
  `details` text,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  CONSTRAINT `health_records_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: medicines
DROP TABLE IF EXISTS `medicines`;
CREATE TABLE `medicines` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `stock_quantity` int DEFAULT '0',
  `is_available` tinyint(1) DEFAULT '1',
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: pharmacies
DROP TABLE IF EXISTS `pharmacies`;
CREATE TABLE `pharmacies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `license_number` varchar(100) DEFAULT NULL,
  `address` text,
  `opening_time` time DEFAULT NULL,
  `closing_time` time DEFAULT NULL,
  `home_delivery` tinyint(1) DEFAULT '0',
  `chain_name` varchar(255) DEFAULT NULL,
  `district` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `pharmacies_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: pharmacy_stock
DROP TABLE IF EXISTS `pharmacy_stock`;
CREATE TABLE `pharmacy_stock` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pharmacy_id` int NOT NULL,
  `medicine_id` int NOT NULL,
  `quantity` int DEFAULT '0',
  `price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pharmacy_id` (`pharmacy_id`),
  KEY `medicine_id` (`medicine_id`),
  CONSTRAINT `pharmacy_stock_ibfk_1` FOREIGN KEY (`pharmacy_id`) REFERENCES `pharmacies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pharmacy_stock_ibfk_2` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: documents
DROP TABLE IF EXISTS `documents`;
CREATE TABLE `documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `file_url` varchar(255) NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- --------------------------------------------------------
-- 2. Seed Data (Initial Users & Configuration)
-- --------------------------------------------------------

-- Users
-- Password for all: password123 (hashed with pbkdf2)
INSERT INTO users (id, full_name, email, password_hash, role, status) VALUES 
(1, 'Rahul Sharma', 'patient@test.com', '$pbkdf2-sha256$29000$OwegtFaqlXIupbQWQqg1Zg$gQVtWfWhcSi4M7B.bhO2CYZsOo5/a4l1UQK3B6LCFME', 'patient', 'active'),
(2, 'Dr. Aditi Gupta', 'doctor@test.com', '$pbkdf2-sha256$29000$OwegtFaqlXIupbQWQqg1Zg$gQVtWfWhcSi4M7B.bhO2CYZsOo5/a4l1UQK3B6LCFME', 'doctor', 'approved'),
(3, 'City Pharmacy', 'pharma@test.com', '$pbkdf2-sha256$29000$OwegtFaqlXIupbQWQqg1Zg$gQVtWfWhcSi4M7B.bhO2CYZsOo5/a4l1UQK3B6LCFME', 'pharmacy', 'approved'),
(4, 'Super Admin', 'admin@test.com', '$pbkdf2-sha256$29000$OwegtFaqlXIupbQWQqg1Zg$gQVtWfWhcSi4M7B.bhO2CYZsOo5/a4l1UQK3B6LCFME', 'admin', 'active'),
(5, 'Dr. Newbie', 'pending_doc@test.com', '$pbkdf2-sha256$29000$OwegtFaqlXIupbQWQqg1Zg$gQVtWfWhcSi4M7B.bhO2CYZsOo5/a4l1UQK3B6LCFME', 'doctor', 'pending_admin_approval'),
(6, 'New Pharma', 'pending_pharma@test.com', '$pbkdf2-sha256$29000$OwegtFaqlXIupbQWQqg1Zg$gQVtWfWhcSi4M7B.bhO2CYZsOo5/a4l1UQK3B6LCFME', 'pharmacy', 'pending_admin_approval');

-- Profiles
INSERT INTO patients (id, user_id, full_name, date_of_birth, gender) VALUES
(1, 1, 'Rahul Sharma', '1990-05-15', 'Male');

INSERT INTO doctors (id, user_id, full_name, specialization, registration_number) VALUES
(1, 2, 'Dr. Aditi Gupta', 'General Physician', 'REG12345'),
(2, 5, 'Dr. Newbie', 'Dentist', 'PENDING-REG');

INSERT INTO doctor_profiles (user_id, qualification, specialty, experience, about, languages, fee, hospital) VALUES
(2, 'MBBS, MD', 'General Physician', '10 Years', 'Committed to providing compassionate care.', 'English, Hindi', 500.00, 'City Hospital');

INSERT INTO pharmacies (id, user_id, license_number, address, opening_time, closing_time) VALUES
(1, 3, 'LIC-987654', '123 Main St, Metro City', '09:00:00', '22:00:00'),
(2, 6, 'LIC-PENDING', '456 New St, Metro City', '10:00:00', '20:00:00');

-- Medicines
INSERT INTO medicines (id, name, type, price, stock_quantity, is_available) VALUES 
(1, 'Paracetamol', 'Tablet', 5.00, 100, TRUE),
(2, 'Amoxicillin', 'Capsule', 12.50, 50, TRUE),
(3, 'Cough Syrup', 'Syrup', 8.00, 30, TRUE),
(4, 'Vitamin C', 'Tablet', 3.00, 200, TRUE),
(5, 'Bandage', 'First Aid', 2.00, 100, TRUE);

-- Pharmacy Stock
INSERT INTO pharmacy_stock (pharmacy_id, medicine_id, quantity) VALUES
(1, 1, 50), -- Paracetamol
(1, 2, 20), -- Amoxicillin
(1, 3, 10); -- Cough Syrup

-- Appointments & Records
-- Note: patient_id = 1 (Rahul), doctor_id = 2 (Aditi - UserID)
INSERT INTO appointments (patient_id, doctor_id, appointment_datetime, reason, status, video_room_code) VALUES
(1, 2, DATE_ADD(NOW(), INTERVAL 1 DAY), 'Regular Checkup', 'scheduled', 'room-123'),
(1, 2, DATE_SUB(NOW(), INTERVAL 2 DAY), 'Fever', 'completed', 'room-old');

INSERT INTO health_records (patient_id, doctor_name, record_type, record_date, details) VALUES
(1, 'Dr. Aditi Gupta', 'Prescription', DATE_SUB(NOW(), INTERVAL 2 DAY), 'Paracetamol 500mg BD for 3 days');


-- --------------------------------------------------------
-- 3. Mock Doctors (Additional Data)
-- --------------------------------------------------------

-- Inserting Users
INSERT INTO users (full_name, email, mobile, password_hash, role, status) VALUES 
('Dr. Sarah Khan', 'sarah.cardio@test.com', '9876543210', '$pbkdf2-sha256$29000$1g/jS.L/u.w$s/d...placeholder...', 'doctor', 'active'),
('Dr. Rajesh Koothrappali', 'raj.derma@test.com', '9876543211', '$pbkdf2-sha256$29000$1g/jS.L/u.w$s/d...placeholder...', 'doctor', 'active'),
('Dr. Meredith Grey', 'meredith.gen@test.com', '9876543212', '$pbkdf2-sha256$29000$1g/jS.L/u.w$s/d...placeholder...', 'doctor', 'active'),
('Dr. Gregory House', 'house.diag@test.com', '9876543213', '$pbkdf2-sha256$29000$1g/jS.L/u.w$s/d...placeholder...', 'doctor', 'active');

-- Inserting Doctors Profiles
INSERT INTO doctors (user_id, full_name, specialization, registration_number, clinic_name, clinic_address)
SELECT id, full_name, 'Cardiologist', 'REG-CARD-001', 'Heart Care Clinic', '123 Heartbeat Lane, Delhi'
FROM users WHERE email = 'sarah.cardio@test.com';

INSERT INTO doctors (user_id, full_name, specialization, registration_number, clinic_name, clinic_address)
SELECT id, full_name, 'Dermatologist', 'REG-DERM-002', 'Skin Deep Clinic', '456 Glow Road, Mumbai'
FROM users WHERE email = 'raj.derma@test.com';

INSERT INTO doctors (user_id, full_name, specialization, registration_number, clinic_name, clinic_address)
SELECT id, full_name, 'General Physician', 'REG-GEN-003', 'Grey Sloan Memorial', '789 Seattle Drive, Bangalore'
FROM users WHERE email = 'meredith.gen@test.com';

INSERT INTO doctors (user_id, full_name, specialization, registration_number, clinic_name, clinic_address)
SELECT id, full_name, 'Diagnostician', 'REG-DIAG-004', 'Princeton Plainsboro', '101 Logic St, Hyderabad'
FROM users WHERE email = 'house.diag@test.com';

-- Update Doctor Profiles (Fee, Experience etc)
INSERT INTO doctor_profiles (user_id, qualification, specialty, experience, about, languages, fee, hospital)
SELECT id, 'MD Cardiology', 'Cardiologist', '10 Years', 'Expert in heart rhythm disorders.', 'English, Hindi', 1500.00, 'Heart Care Clinic'
FROM users WHERE email = 'sarah.cardio@test.com';

INSERT INTO doctor_profiles (user_id, qualification, specialty, experience, about, languages, fee, hospital)
SELECT id, 'MD Dermatology', 'Dermatologist', '8 Years', 'Specialist in skin care and cosmetic procedures.', 'English, Tamil', 1000.00, 'Skin Deep Clinic'
FROM users WHERE email = 'raj.derma@test.com';

INSERT INTO doctor_profiles (user_id, qualification, specialty, experience, about, languages, fee, hospital)
SELECT id, 'MBBS, MD', 'General Physician', '15 Years', 'Compassionate care for general ailments.', 'English', 800.00, 'Grey Sloan Memorial'
FROM users WHERE email = 'meredith.gen@test.com';

INSERT INTO doctor_profiles (user_id, qualification, specialty, experience, about, languages, fee, hospital)
SELECT id, 'MD, PhD', 'Diagnostician', '20 Years', 'Specializes in rare diseases.', 'English, Spanish', 2500.00, 'Princeton Plainsboro'
FROM users WHERE email = 'house.diag@test.com';

SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;
-- schema_enhancements.sql

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
