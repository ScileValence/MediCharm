-- -----------------------------------------------------
-- Database: medicharm (PostgreSQL)
-- -----------------------------------------------------
-- Create the database itself with:  createdb medicharm
-- (or via your host's dashboard, e.g. Render). Postgres has no
-- CREATE DATABASE IF NOT EXISTS / USE statement — connect to the
-- "medicharm" database directly, then run the rest of this file.

-- -----------------------------------------------------
-- Table: users
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255),
  role VARCHAR(50) DEFAULT 'PATIENT'
);

-- -----------------------------------------------------
-- Table: doctors
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS doctors (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE,
  dept VARCHAR(100),
  phone VARCHAR(30)
);

-- -----------------------------------------------------
-- Table: appointments
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS appointments (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  doctor_id BIGINT,
  dept VARCHAR(100),
  appointment_time TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'SCHEDULED',
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
);

-- -----------------------------------------------------
-- Table: medicines
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS medicines (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0,
  pack VARCHAR(100)
);

-- -----------------------------------------------------
-- Table: orders
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  subtotal DECIMAL(10,2),
  shipping DECIMAL(10,2),
  total DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'PLACED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Table: order_items
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL,
  medicine_id BIGINT NOT NULL,
  qty INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (medicine_id) REFERENCES medicines(id)
);

-- -----------------------------------------------------
-- Table: health_reports (future feature)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS health_reports (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  report_text TEXT,
  report_file VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Seed data: doctors & medicines
-- -----------------------------------------------------
INSERT INTO doctors (name, email, dept, phone) VALUES
('Dr. Arjun Mehta', 'arjun@hospital.com', 'Cardiology', '9999999991'),
('Dr. Kavita Rao', 'kavita@hospital.com', 'Cardiology', '9999999992'),
('Dr. Nisha Sharma', 'nisha@hospital.com', 'Neurology', '9999999993');

INSERT INTO medicines (name, description, price, stock, pack) VALUES
('Paracetamol 500mg', 'Pain reliever / fever reducer', 50, 100, '10 tablets'),
('Amoxicillin 500mg', 'Antibiotic', 120, 50, '10 capsules'),
('Vitamin C 500mg', 'Immune support', 150, 75, '30 tablets'),
('Cough Syrup 100ml', 'Soothes cough & throat', 90, 40, '100 ml'),
('Ibuprofen 400mg', 'Anti-inflammatory', 80, 60, '10 tablets'),
('Antacid Tablets', 'Relieves acidity', 40, 80, '10 tablets');
