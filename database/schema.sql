-- Dance Academy - Base de datos
-- Proyecto Final DS1 - Universidad del Valle

DROP DATABASE IF EXISTS dance_academy;
CREATE DATABASE dance_academy;

\c dance_academy;

CREATE TYPE user_role AS ENUM ('admin', 'instructor', 'student');
CREATE TYPE enrollment_status AS ENUM ('active', 'cancelled', 'completed');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'overdue');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'excused');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    document_id VARCHAR(20) UNIQUE NOT NULL,
    phone VARCHAR(20),
    birth_date DATE,
    address TEXT,
    emergency_contact VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE instructors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    document_id VARCHAR(20) UNIQUE NOT NULL,
    phone VARCHAR(20),
    specialty VARCHAR(100),
    bio TEXT,
    hire_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dance_styles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    difficulty_level VARCHAR(50) DEFAULT 'beginner'
);

CREATE TABLE classrooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 20,
    location VARCHAR(200)
);

CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    dance_style_id INTEGER REFERENCES dance_styles(id),
    instructor_id INTEGER REFERENCES instructors(id),
    classroom_id INTEGER REFERENCES classrooms(id),
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_students INTEGER DEFAULT 20,
    monthly_fee DECIMAL(10,2) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status enrollment_status DEFAULT 'active',
    UNIQUE(student_id, class_id)
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER REFERENCES enrollments(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    status payment_status DEFAULT 'pending',
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER REFERENCES enrollments(id) ON DELETE CASCADE,
    class_date DATE NOT NULL,
    status attendance_status DEFAULT 'present',
    notes TEXT,
    recorded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(enrollment_id, class_date)
);

-- Datos semilla
INSERT INTO dance_styles (name, description, difficulty_level) VALUES
('Salsa', 'Baile caribeño con ritmo contagioso', 'beginner'),
('Bachata', 'Baile romántico originario de República Dominicana', 'beginner'),
('Reggaeton', 'Fusión urbana latina', 'intermediate'),
('Hip Hop', 'Baile urbano con movimientos dinámicos', 'intermediate'),
('Contemporáneo', 'Expresión corporal y técnica moderna', 'advanced'),
('Ballet', 'Danza clásica con técnica formal', 'advanced');

INSERT INTO classrooms (name, capacity, location) VALUES
('Sala Principal', 30, 'Primer piso'),
('Sala Intimista', 15, 'Segundo piso'),
('Sala de Ensayo', 10, 'Sótano');

-- Password: admin123 (bcrypt hash will be set by seed script)
-- Placeholder users - passwords set in seed.js
