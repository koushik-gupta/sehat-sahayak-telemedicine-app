-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: telemedicine_db
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
INSERT INTO `appointments` VALUES (1,1,2,'2026-02-03 21:28:10','Regular Checkup','scheduled','room-123','2026-02-02 15:58:10'),(2,1,2,'2026-01-31 21:28:10','Fever','completed','room-old','2026-02-02 15:58:10'),(3,1,2,'2026-02-02 21:33:22',NULL,'scheduled','229f516661c306a57a704a118e0319c8','2026-02-02 16:03:22');
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctor_availability`
--

DROP TABLE IF EXISTS `doctor_availability`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctor_availability` (
  `id` int NOT NULL AUTO_INCREMENT,
  `doctor_id` int NOT NULL,
  `day_of_week` varchar(15) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `is_available` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_schedule` (`doctor_id`,`day_of_week`),
  CONSTRAINT `doctor_availability_ibfk_1` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctor_availability`
--

LOCK TABLES `doctor_availability` WRITE;
/*!40000 ALTER TABLE `doctor_availability` DISABLE KEYS */;
INSERT INTO `doctor_availability` VALUES (1,10,'Monday','09:00:00','17:00:00',1),(2,10,'Wednesday','09:00:00','17:00:00',1),(3,10,'Friday','09:00:00','14:00:00',1),(4,11,'Tuesday','10:00:00','18:00:00',1),(5,11,'Thursday','10:00:00','18:00:00',1);
/*!40000 ALTER TABLE `doctor_availability` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctor_profiles`
--

DROP TABLE IF EXISTS `doctor_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctor_profiles`
--

LOCK TABLES `doctor_profiles` WRITE;
/*!40000 ALTER TABLE `doctor_profiles` DISABLE KEYS */;
INSERT INTO `doctor_profiles` VALUES (2,'MBBS, MD','General Physician','10 Years','Committed to providing compassionate care.','English, Hindi',500.00,'City Hospital',NULL),(10,'MD Cardiology','Cardiologist','10 Years','Expert in heart rhythm disorders.','English, Hindi',1500.00,'Heart Care Clinic',NULL),(11,'MD Dermatology','Dermatologist','8 Years','Specialist in skin care and cosmetic procedures.','English, Tamil',1000.00,'Skin Deep Clinic',NULL),(12,'MBBS, MD','General Physician','15 Years','Compassionate care for general ailments.','English',800.00,'Grey Sloan Memorial',NULL),(13,'MD, PhD','Diagnostician','20 Years','Specializes in rare diseases.','English, Spanish',2500.00,'Princeton Plainsboro',NULL);
/*!40000 ALTER TABLE `doctor_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctors`
--

DROP TABLE IF EXISTS `doctors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `registration_number` varchar(50) NOT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `clinic_name` varchar(255) DEFAULT NULL,
  `clinic_address` text,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `doctors_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctors`
--

LOCK TABLES `doctors` WRITE;
/*!40000 ALTER TABLE `doctors` DISABLE KEYS */;
INSERT INTO `doctors` VALUES (1,2,'Dr. Aditi Gupta','General Physician','REG12345',NULL,NULL,NULL),(2,5,'Dr. Newbie','Dentist','PENDING-REG',NULL,NULL,NULL),(3,10,'Dr. Sarah Khan','Cardiologist','REG-CARD-001',NULL,'Heart Care Clinic','123 Heartbeat Lane, Delhi'),(4,11,'Dr. Rajesh Koothrappali','Dermatologist','REG-DERM-002',NULL,'Skin Deep Clinic','456 Glow Road, Mumbai'),(5,12,'Dr. Meredith Grey','General Physician','REG-GEN-003',NULL,'Grey Sloan Memorial','789 Seattle Drive, Bangalore'),(6,13,'Dr. Gregory House','Diagnostician','REG-DIAG-004',NULL,'Princeton Plainsboro','101 Logic St, Hyderabad');
/*!40000 ALTER TABLE `doctors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documents`
--

DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `file_name` varchar(255) NOT NULL DEFAULT 'document',
  `file_type` varchar(50) DEFAULT NULL,
  `file_url` varchar(255) NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documents`
--

LOCK TABLES `documents` WRITE;
/*!40000 ALTER TABLE `documents` DISABLE KEYS */;
INSERT INTO `documents` VALUES (1,1,'1_DATAMINING_CA1.pdf',NULL,'/uploads/1_DATAMINING_CA1.pdf','2026-02-05 14:53:51'),(2,1,'1_DATAMINING_CA1.pdf',NULL,'/uploads/1_DATAMINING_CA1.pdf','2026-02-05 14:54:06'),(3,1,'1_DATAMINING_CA1.pdf',NULL,'/uploads/1_DATAMINING_CA1.pdf','2026-02-05 14:57:49');
/*!40000 ALTER TABLE `documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `health_records`
--

DROP TABLE IF EXISTS `health_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `health_records`
--

LOCK TABLES `health_records` WRITE;
/*!40000 ALTER TABLE `health_records` DISABLE KEYS */;
INSERT INTO `health_records` VALUES (1,1,'Dr. Aditi Gupta','Prescription','2026-01-31','Paracetamol 500mg BD for 3 days');
/*!40000 ALTER TABLE `health_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicines`
--

DROP TABLE IF EXISTS `medicines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicines` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `stock_quantity` int DEFAULT '0',
  `is_available` tinyint(1) DEFAULT '1',
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicines`
--

LOCK TABLES `medicines` WRITE;
/*!40000 ALTER TABLE `medicines` DISABLE KEYS */;
INSERT INTO `medicines` VALUES (1,'Paracetamol','Tablet',5.00,100,1,NULL),(2,'Amoxicillin','Capsule',12.50,50,1,NULL),(3,'Cough Syrup','Syrup',8.00,30,1,NULL),(4,'Vitamin C','Tablet',3.00,200,1,NULL),(5,'Bandage','First Aid',2.00,100,1,NULL),(6,'dolo 650',NULL,NULL,0,1,NULL),(7,'crosin',NULL,NULL,0,1,NULL),(8,'azithromycin',NULL,NULL,0,1,NULL);
/*!40000 ALTER TABLE `medicines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients`
--

LOCK TABLES `patients` WRITE;
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
INSERT INTO `patients` VALUES (1,1,'Rahul Sharma','2004-12-26','Male',NULL,'8 sagar manna road,behala','O+','90',NULL),(2,19,'Demo Patient','2004-12-26','Male',NULL,'Sample Address, Kolkata','O+','85',NULL);
/*!40000 ALTER TABLE `patients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pharmacies`
--

DROP TABLE IF EXISTS `pharmacies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pharmacies`
--

LOCK TABLES `pharmacies` WRITE;
/*!40000 ALTER TABLE `pharmacies` DISABLE KEYS */;
INSERT INTO `pharmacies` VALUES (1,3,'LIC-987654','Connaught Place','09:00:00','22:00:00',0,'Apollo','South Delhi','Delhi'),(2,6,'LIC-PENDING','456 New St, Metro City','10:00:00','20:00:00',0,NULL,NULL,NULL),(3,7,NULL,'Saket M Block',NULL,NULL,0,'Apollo','South Delhi','Delhi'),(4,8,NULL,'Sector 18',NULL,NULL,0,'Apollo','Noida','Delhi'),(5,9,NULL,'GK 1',NULL,NULL,0,'MedPlus','South Delhi','Delhi');
/*!40000 ALTER TABLE `pharmacies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pharmacy_order_items`
--

DROP TABLE IF EXISTS `pharmacy_order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pharmacy_order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `medicine_name` varchar(255) NOT NULL,
  `quantity` int NOT NULL,
  `price_per_unit` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `pharmacy_order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `pharmacy_orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pharmacy_order_items`
--

LOCK TABLES `pharmacy_order_items` WRITE;
/*!40000 ALTER TABLE `pharmacy_order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `pharmacy_order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pharmacy_orders`
--

DROP TABLE IF EXISTS `pharmacy_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pharmacy_orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pharmacy_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','accepted','rejected','completed') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `pharmacy_id` (`pharmacy_id`),
  KEY `patient_id` (`patient_id`),
  CONSTRAINT `pharmacy_orders_ibfk_1` FOREIGN KEY (`pharmacy_id`) REFERENCES `pharmacies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pharmacy_orders_ibfk_2` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pharmacy_orders`
--

LOCK TABLES `pharmacy_orders` WRITE;
/*!40000 ALTER TABLE `pharmacy_orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `pharmacy_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pharmacy_stock`
--

DROP TABLE IF EXISTS `pharmacy_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pharmacy_stock`
--

LOCK TABLES `pharmacy_stock` WRITE;
/*!40000 ALTER TABLE `pharmacy_stock` DISABLE KEYS */;
INSERT INTO `pharmacy_stock` VALUES (40,1,3,10,0.00),(41,1,1,50,NULL),(42,1,2,20,NULL),(48,3,1,50,20.00),(49,3,6,5,30.50),(50,4,1,100,18.00),(51,5,1,500,10.00),(52,5,8,20,100.00),(53,1,1,10,0.00),(54,1,1,30,20.00);
/*!40000 ALTER TABLE `pharmacy_stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescription_items`
--

DROP TABLE IF EXISTS `prescription_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescription_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `prescription_id` int NOT NULL,
  `medicine_name` varchar(255) NOT NULL,
  `dosage` varchar(100) DEFAULT NULL,
  `frequency` varchar(100) DEFAULT NULL,
  `duration` varchar(100) DEFAULT NULL,
  `instructions` text,
  PRIMARY KEY (`id`),
  KEY `prescription_id` (`prescription_id`),
  CONSTRAINT `prescription_items_ibfk_1` FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescription_items`
--

LOCK TABLES `prescription_items` WRITE;
/*!40000 ALTER TABLE `prescription_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `prescription_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescriptions`
--

DROP TABLE IF EXISTS `prescriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int DEFAULT NULL,
  `patient_id` int NOT NULL,
  `doctor_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `notes` text,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `doctor_id` (`doctor_id`),
  CONSTRAINT `prescriptions_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `prescriptions_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescriptions`
--

LOCK TABLES `prescriptions` WRITE;
/*!40000 ALTER TABLE `prescriptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `prescriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  `gender` varchar(20) DEFAULT 'Other',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `mobile` (`mobile`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Rahul Sharma','patient@test.com',NULL,'$pbkdf2-sha256$29000$OwegtFaqlXIupbQWQqg1Zg$gQVtWfWhcSi4M7B.bhO2CYZsOo5/a4l1UQK3B6LCFME','patient','active',NULL,NULL,NULL,'2026-02-02 15:58:10',NULL,'Other'),(2,'Dr. Aditi Gupta','doctor@test.com',NULL,'$pbkdf2-sha256$29000$OwegtFaqlXIupbQWQqg1Zg$gQVtWfWhcSi4M7B.bhO2CYZsOo5/a4l1UQK3B6LCFME','doctor','approved',NULL,NULL,NULL,'2026-02-02 15:58:10',NULL,'Other'),(3,'City Pharmacy','pharma@test.com',NULL,'$pbkdf2-sha256$29000$OwegtFaqlXIupbQWQqg1Zg$gQVtWfWhcSi4M7B.bhO2CYZsOo5/a4l1UQK3B6LCFME','pharmacy','approved',NULL,NULL,NULL,'2026-02-02 15:58:10',NULL,'Other'),(4,'Super Admin','admin@test.com',NULL,'$pbkdf2-sha256$29000$OwegtFaqlXIupbQWQqg1Zg$gQVtWfWhcSi4M7B.bhO2CYZsOo5/a4l1UQK3B6LCFME','admin','active',NULL,NULL,NULL,'2026-02-02 15:58:10',NULL,'Other'),(5,'Dr. Newbie','pending_doc@test.com',NULL,'$pbkdf2-sha256$29000$OwegtFaqlXIupbQWQqg1Zg$gQVtWfWhcSi4M7B.bhO2CYZsOo5/a4l1UQK3B6LCFME','doctor','pending_admin_approval',NULL,NULL,NULL,'2026-02-02 15:58:10',NULL,'Other'),(6,'New Pharma','pending_pharma@test.com',NULL,'$pbkdf2-sha256$29000$OwegtFaqlXIupbQWQqg1Zg$gQVtWfWhcSi4M7B.bhO2CYZsOo5/a4l1UQK3B6LCFME','pharmacy','pending_admin_approval',NULL,NULL,NULL,'2026-02-02 15:58:10',NULL,'Other'),(7,'Apollo Saket','apollo_nearby@test.com',NULL,'$pbkdf2-sha256$29000$zxmDUIqxdq5VKkWoFUJICQ$J454urqkmKuAUNuZkTTAzU5po7YSe5.G955cIxUyrx0','pharmacy','active',NULL,NULL,NULL,'2026-02-04 14:50:49',NULL,'Other'),(8,'Apollo Noida','apollo_far@test.com',NULL,'$pbkdf2-sha256$29000$5DyHUGpN6V0LYQyB8P4/Rw$rDb89lQbOoYrDUYDk.kThtvpAUnYFGbwJJI2BUrjCew','pharmacy','active',NULL,NULL,NULL,'2026-02-04 14:50:49',NULL,'Other'),(9,'MedPlus GK','medplus@test.com',NULL,'$pbkdf2-sha256$29000$3HuPsVaqlTIGYAwhBMCYcw$g/0xGlFG5tPkhSht2AJNdBDsq62v7Nmn9hgvf4iaDg8','pharmacy','active',NULL,NULL,NULL,'2026-02-04 14:50:49',NULL,'Other'),(10,'Dr. Sarah Khan','sarah.cardio@test.com','9876543210','$pbkdf2-sha256$29000$1g/jS.L/u.w$s/d...placeholder...','doctor','active',NULL,NULL,NULL,'2026-02-04 15:51:57',NULL,'Other'),(11,'Dr. Rajesh Koothrappali','raj.derma@test.com','9876543211','$pbkdf2-sha256$29000$1g/jS.L/u.w$s/d...placeholder...','doctor','active',NULL,NULL,NULL,'2026-02-04 15:51:57',NULL,'Other'),(12,'Dr. Meredith Grey','meredith.gen@test.com','9876543212','$pbkdf2-sha256$29000$1g/jS.L/u.w$s/d...placeholder...','doctor','active',NULL,NULL,NULL,'2026-02-04 15:51:57',NULL,'Other'),(13,'Dr. Gregory House','house.diag@test.com','9876543213','$pbkdf2-sha256$29000$1g/jS.L/u.w$s/d...placeholder...','doctor','active',NULL,NULL,NULL,'2026-02-04 15:51:57',NULL,'Other'),(19,'Demo Patient','demo.patient@example.com','9000000000','$pbkdf2-sha256$29000$N8aYs/Ye41zL2fufUyqF0A$0CC6i73J1uftuLIQR8N27m9Oh0I/3F.d3BMoZT2vpes','patient','active',NULL,NULL,NULL,'2026-02-05 15:30:10',NULL,'Other');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-16 20:19:37
