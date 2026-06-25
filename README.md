# RITMOFLOW — Academia de Baile en Línea

Proyecto final de **Desarrollo de Software I** (750009C) — Universidad del Valle, 2026A.

Plataforma web para una academia en línea de baile que gestiona usuarios internos, clientes, catálogo de coreografías en video, carrito de compras, ventas y acceso al contenido comprado.

## Características principales

- **4 roles de usuario:** Administrador, Director, Profesor bailarín y Cliente
- **Autenticación JWT** con CAPTCHA en login y recuperación de contraseña por correo
- **Catálogo de coreografías** con paquetes de videos, filtros y aprobación por Director/Admin
- **Carrito persistente** y checkout por pasos (ítems → datos → pago → confirmación)
- **Acceso a videos comprados** con reproductor y seguimiento de progreso
- **Dashboards** con métricas y gráficas (Recharts) para Admin, Cliente y Profesor
- **Seguridad por rol** y ownership de recursos (carrito, compras, coreografías)

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Recharts |
| Backend | Django 6, Django REST Framework, Simple JWT |
| Base de datos | PostgreSQL 14+ |
| Otros | django-simple-captcha, psycopg3, python-dotenv |

## Inicio rápido

### Requisitos

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

### 1. Base de datos

```powershell
psql -U postgres -c "CREATE DATABASE ritmoflow;"
```

### 2. Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
DJANGO_SECRET_KEY=tu-clave-secreta
DEBUG=True

DB_NAME=ritmoflow
DB_USER=postgres
DB_PASSWORD=tu_contraseña_de_postgresql
DB_HOST=localhost
DB_PORT=5432

FRONTEND_URL=http://localhost:5173
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
DEFAULT_FROM_EMAIL=noreply@ritmoflow.com
```

### 3. Backend

```powershell
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

### 4. Frontend

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

## Estructura del repositorio

```
Proyecto_final_DS1/
├── ritmoflow/           # Configuración Django (settings, urls)
├── users/               # Autenticación, perfiles, usuarios internos, dashboards
├── choreographies/      # Catálogo de coreografías y videos
├── cart/                # Carrito de compras persistente
├── sales/               # Ventas, checkout y acceso a contenido
├── frontend/            # Aplicación React (RITMOFLOW UI)
├── database/            # Notas de esquema SQL
├── docs/                # Documentación técnica del proyecto
├── requirements.txt
└── manage.py
```

## Rutas del frontend

| Ruta | Descripción | Rol |
|------|-------------|-----|
| `/` | Landing page | Público |
| `/catalog` | Catálogo de coreografías | Público |
| `/login` | Inicio de sesión con CAPTCHA | Público |
| `/register` | Registro de cliente | Público |
| `/forgot-password` | Solicitar recuperación de clave | Público |
| `/reset-password` | Restablecer contraseña | Público |
| `/profile` | Editar perfil personal | Autenticado |
| `/cart` | Carrito de compras | Cliente |
| `/checkout` | Checkout por pasos | Cliente |
| `/dashboard` | Dashboard del cliente | Cliente |
| `/my-choreographies/:id` | Reproductor de videos comprados | Cliente |
| `/professor` | Dashboard del profesor | Profesor |
| `/admin` | Panel de administración | Admin / Director |
| `/admin/users` | Gestión de usuarios internos | Admin / Director |
| `/admin/choreographies` | Listado y aprobación de coreografías | Admin / Director / Profesor |
| `/admin/choreographies/new` | Crear coreografía | Admin / Director / Profesor |
| `/admin/choreographies/:id/edit` | Editar coreografía | Admin / Director / Profesor |
| `/admin/sales` | Reporte de ventas | Admin / Director |
| `/admin/professors` | Listado de profesores | Admin / Director |

## Documentación

La documentación técnica completa está en la carpeta [`docs/`](docs/README.md):

- [Índice de documentación](docs/README.md)
- [Arquitectura del sistema](docs/arquitectura.md)
- [Modelos de datos](docs/modelos.md)
- [API REST](docs/api.md)
- [Roles y permisos](docs/roles-y-permisos.md)
- [Frontend](docs/frontend.md)
- [Flujos de negocio](docs/flujos.md)
- [Guía de instalación detallada](docs/instalacion.md)

## Diseño

- Marca: **RITMOFLOW**
- Colores: Naranja `#FF6B1A`, Fucsia `#E91E8C`, Crema `#FFF8F0`
- Tema oscuro

## Equipo

- Yoselin Natalia Cardona
- Angie Daniela Valencia
- Jhonnier Andres Becerra
- Kevin David Muñoz
- Juan Pablo Montealegre

Universidad del Valle · Facultad de Ingeniería · EISC · Grupo 80
