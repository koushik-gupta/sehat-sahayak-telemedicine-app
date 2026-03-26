CREATE TABLE IF NOT EXISTS "users" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "full_name" TEXT,
    "email" TEXT,
    "mobile" TEXT,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'patient',
    "status" TEXT DEFAULT 'active',
    "aadhar_number" TEXT,
    "otp" TEXT,
    "otp_expires_at" TEXT,
    "created_at" TEXT DEFAULT CURRENT_TIMESTAMP,
    "profile_picture" TEXT,
    "gender" TEXT DEFAULT 'Other',
    UNIQUE ("email"),
    UNIQUE ("mobile")
);

CREATE TABLE IF NOT EXISTS "patients" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "full_name" TEXT NOT NULL,
    "date_of_birth" TEXT,
    "gender" TEXT,
    "contact_number" TEXT,
    "address" TEXT,
    "blood_group" TEXT,
    "weight" TEXT,
    "height" TEXT,
    FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "doctors" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "full_name" TEXT NOT NULL,
    "specialization" TEXT,
    "registration_number" TEXT NOT NULL,
    "contact_number" TEXT,
    "clinic_name" TEXT,
    "clinic_address" TEXT,
    FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "doctor_profiles" (
    "user_id" INTEGER NOT NULL,
    "qualification" TEXT,
    "specialty" TEXT,
    "experience" TEXT,
    "about" TEXT,
    "languages" TEXT,
    "fee" REAL,
    "hospital" TEXT,
    "profile_pic_url" TEXT,
    PRIMARY KEY ("user_id"),
    FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "medicines" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "price" REAL,
    "stock_quantity" INTEGER DEFAULT '0',
    "is_available" INTEGER DEFAULT '1',
    "description" TEXT
);

CREATE TABLE IF NOT EXISTS "pharmacies" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "license_number" TEXT,
    "address" TEXT,
    "opening_time" TEXT,
    "closing_time" TEXT,
    "home_delivery" INTEGER DEFAULT '0',
    "chain_name" TEXT,
    "district" TEXT,
    "state" TEXT,
    FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "appointments" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "patient_id" INTEGER NOT NULL,
    "doctor_id" INTEGER NOT NULL,
    "appointment_datetime" TEXT NOT NULL,
    "reason" TEXT,
    "status" TEXT DEFAULT 'scheduled',
    "video_room_code" TEXT,
    "created_at" TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY("patient_id") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY("doctor_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "documents" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "file_name" TEXT NOT NULL DEFAULT 'document',
    "file_type" TEXT,
    "file_url" TEXT NOT NULL,
    "uploaded_at" TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "health_records" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "patient_id" INTEGER NOT NULL,
    "doctor_name" TEXT,
    "record_type" TEXT NOT NULL,
    "record_date" TEXT NOT NULL,
    "details" TEXT,
    FOREIGN KEY("patient_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "pharmacy_stock" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "pharmacy_id" INTEGER NOT NULL,
    "medicine_id" INTEGER NOT NULL,
    "quantity" INTEGER DEFAULT '0',
    "price" REAL,
    FOREIGN KEY("pharmacy_id") REFERENCES "pharmacies"("id") ON DELETE CASCADE,
    FOREIGN KEY("medicine_id") REFERENCES "medicines"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "doctor_availability" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "doctor_id" INTEGER NOT NULL,
    "day_of_week" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "is_available" INTEGER DEFAULT '1',
    UNIQUE ("doctor_id", "day_of_week"),
    FOREIGN KEY("doctor_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "pharmacy_orders" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "pharmacy_id" INTEGER NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "total_amount" REAL NOT NULL,
    "status" TEXT DEFAULT 'pending',
    "created_at" TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY("pharmacy_id") REFERENCES "pharmacies"("id") ON DELETE CASCADE,
    FOREIGN KEY("patient_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "pharmacy_order_items" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "order_id" INTEGER NOT NULL,
    "medicine_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price_per_unit" REAL NOT NULL,
    FOREIGN KEY("order_id") REFERENCES "pharmacy_orders"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "prescriptions" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "appointment_id" INTEGER,
    "patient_id" INTEGER NOT NULL,
    "doctor_id" INTEGER NOT NULL,
    "created_at" TEXT DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    FOREIGN KEY("patient_id") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY("doctor_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "prescription_items" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "prescription_id" INTEGER NOT NULL,
    "medicine_name" TEXT NOT NULL,
    "dosage" TEXT,
    "frequency" TEXT,
    "duration" TEXT,
    "instructions" TEXT,
    FOREIGN KEY("prescription_id") REFERENCES "prescriptions"("id") ON DELETE CASCADE
);
