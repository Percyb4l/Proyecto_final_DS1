# Dance Academy - Sistema de Gestión

Proyecto final de la materia **Desarrollo de Software I** de la Universidad del Valle.

Sistema web completo para la gestión de una academia de baile: estudiantes, instructores, clases, inscripciones, pagos y asistencia.

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Base de datos | PostgreSQL 16 |
| Autenticación | JWT con roles (admin, instructor, student) |

## Módulos implementados

- **Landing page** pública con clases y estilos de baile
- **Autenticación** (login, registro de estudiantes)
- **Dashboard** con estadísticas (admin)
- **CRUD Estudiantes** (admin)
- **CRUD Instructores** (admin)
- **CRUD Clases** con horarios, salones y tarifas
- **Inscripciones** (admin y auto-inscripción de estudiantes)
- **Pagos** con registro y seguimiento de estado
- **Control de asistencia** por clase y fecha

## Requisitos previos

- Node.js 18+
- PostgreSQL 14+

## Instalación

### 1. Base de datos

```bash
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
sudo -u postgres psql -f database/schema.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # Ajustar credenciales si es necesario
npm install
npm run seed           # Insertar datos de prueba
npm run dev            # http://localhost:3001
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

## Usuarios de prueba

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Administrador | admin@danceacademy.com | admin123 |
| Instructor | carlos.instructor@danceacademy.com | admin123 |
| Estudiante | ana.estudiante@danceacademy.com | admin123 |

## Estructura del proyecto

```
├── backend/           # API REST (Express + PostgreSQL)
│   └── src/
│       ├── routes/    # Endpoints por módulo
│       ├── middleware/  # Autenticación JWT
│       └── database/  # Seed de datos
├── frontend/          # Interfaz web (React)
│   └── src/
│       ├── pages/     # Pantallas de la aplicación
│       ├── components/# Layouts y componentes
│       └── services/  # Cliente API
└── database/
    └── schema.sql     # Esquema PostgreSQL
```

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/auth/login | Iniciar sesión |
| POST | /api/auth/register | Registro de estudiante |
| GET | /api/students | Listar estudiantes |
| GET | /api/instructors | Listar instructores |
| GET | /api/classes | Listar clases |
| GET | /api/classes/public | Clases públicas (sin auth) |
| POST | /api/enrollments | Crear inscripción |
| GET | /api/payments | Listar pagos |
| POST | /api/attendance/bulk | Registrar asistencia |
| GET | /api/dashboard | Estadísticas |

## Universidad del Valle

Proyecto académico - Tecnología en Desarrollo de Software - 2026A
