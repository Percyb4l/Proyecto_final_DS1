# Guía de instalación

## Requisitos del sistema

| Componente | Versión mínima |
|------------|----------------|
| Python | 3.11+ |
| Node.js | 18+ |
| PostgreSQL | 14+ |
| npm | 9+ |

## 1. Clonar el repositorio

```powershell
git clone https://github.com/Percyb4l/Proyecto_final_DS1.git
cd Proyecto_final_DS1
```

## 2. Base de datos PostgreSQL

Crear la base de datos:

```powershell
psql -U postgres -c "CREATE DATABASE ritmoflow;"
```

## 3. Variables de entorno

Crear `.env` en la raíz del proyecto (no se sube a Git):

```env
# Django
DJANGO_SECRET_KEY=genera-una-clave-segura-aleatoria
DEBUG=True

# PostgreSQL
DB_NAME=ritmoflow
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_HOST=localhost
DB_PORT=5432

# Frontend (enlaces en correos de recuperación de contraseña)
FRONTEND_URL=http://localhost:5173

# Correo (desarrollo: imprime en consola del servidor Django)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
DEFAULT_FROM_EMAIL=noreply@ritmoflow.com
```

## 4. Backend (Django)

```powershell
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

El API quedará disponible en `http://localhost:8000/api/`.

Verificar salud: `GET http://localhost:8000/api/health/`

## 5. Frontend (React)

En otra terminal:

```powershell
cd frontend
npm install
npm run dev
```

Abrir `http://localhost:5173`. Vite redirige las peticiones `/api/*` al backend en el puerto 8000.

## 6. Datos de prueba

El comando `seed_data` crea:

- 4 usuarios (admin, director, profesor, cliente)
- 6 coreografías publicadas con 4 videos cada una

Ver credenciales en el [README principal](../README.md).

## 7. Ejecutar pruebas

```powershell
python manage.py test
```

Incluye tests de seguridad (`users/tests_security.py`), ventas (`sales/tests.py`, `sales/tests_purchases.py`).

## Solución de problemas

### Error de conexión a PostgreSQL en Windows

- Verificar que PostgreSQL esté en ejecución (`netstat -ano | findstr :5432`)
- Usar `psycopg3` (ya incluido en `requirements.txt`)
- Confirmar `DB_PASSWORD` en `.env`

### CORS / API no responde desde el frontend

- Backend debe estar en puerto 8000
- Frontend usa proxy de Vite; no es necesario configurar CORS manualmente en desarrollo

### Recuperación de contraseña

En desarrollo el correo se imprime en la terminal donde corre `runserver`. Busca el enlace con `reset-password?uid=...&token=...`.
