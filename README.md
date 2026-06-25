# RITMOFLOW - Academia de Baile en Línea

Proyecto final de **Desarrollo de Software I** (750009C) - Universidad del Valle, 2026A.

Plataforma web para una academia en línea de baile que gestiona usuarios internos, clientes, catálogo de coreografías en video, carrito de compras y proceso de ventas.

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS + Recharts |
| Backend | Django 6 + Django REST Framework + JWT |
| Base de datos | PostgreSQL 16 |
| CAPTCHA | django-simple-captcha |

## Módulos implementados

- **Gestión de usuarios internos** (Admin/Director): CRUD con filtros por rol y búsqueda
- **Gestión de clientes**: Auto-registro, perfil, historial de compras
- **Catálogo de coreografías**: CRUD, filtros por género/nivel/profesor, aprobación por Director
- **Carrito de compras**: Persistente en base de datos
- **Proceso de ventas**: Checkout con pago simulado (Tarjeta/PSE)
- **Dashboards**: Admin (gráficos de ventas, top coreografías) y Cliente (progreso, recomendaciones)
- **Autenticación**: Login con CAPTCHA, registro de clientes

## Diseño (Figma)

- Marca: **RITMOFLOW**
- Colores: Naranja `#FF6B1A`, Fucsia `#E91E8C`, Crema `#FFF8F0`
- Tema oscuro ganador del proceso de licitación de bocetos
- 7 pantallas: Landing, Catálogo, Login, Registro, Dashboard Admin, Dashboard Cliente, Carrito

## Instalación

### Requisitos
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

### Base de datos (Windows)
```powershell
psql -U postgres -c "CREATE DATABASE ritmoflow;"
```

Te pedirá la contraseña del usuario `postgres` que definiste al instalar PostgreSQL.

### Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con:

```env
DJANGO_SECRET_KEY=tu-clave-secreta
DEBUG=True
DB_NAME=ritmoflow
DB_USER=postgres
DB_PASSWORD=tu_contraseña_de_postgresql
DB_HOST=localhost
DB_PORT=5432
```

### Backend (Django)
```powershell
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

### Frontend (React)
```powershell
cd frontend
npm install
npm run dev
```

Abrir **http://localhost:5173**

## Usuarios de prueba

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Administrador | admin@ritmoflow.com | admin123 |
| Director | director@ritmoflow.com | admin123 |
| Profesor | carlos.prof@ritmoflow.com | admin123 |
| Cliente | ana@ritmoflow.com | admin123 |

## Estructura

```
├── ritmoflow/          # Configuración Django
├── users/              # Autenticación, usuarios internos, dashboards
├── choreographies/     # Catálogo de coreografías y videos
├── cart/               # Carrito de compras
├── sales/              # Ventas y acceso a contenido
├── frontend/           # React (RITMOFLOW UI)
└── requirements.txt
```

## Equipo

- Yoselin Natalia Cardona
- Angie Daniela Valencia
- Jhonnier Andres Becerra
- Kevin David Muñoz
- Juan Pablo Montealegre

Universidad del Valle · Facultad de Ingeniería · EISC · Grupo 80
