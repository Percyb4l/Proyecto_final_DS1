# Despliegue en la nube — RITMOFLOW

Guía para desplegar el backend en **Render** y el frontend en **Vercel**, con base de datos **PostgreSQL** (Render o Supabase).

## Arquitectura

```
[Vercel — React]  →  HTTPS  →  [Render — Django API]  →  [PostgreSQL]
```

## 1. Base de datos

### Opción A: Render (incluida en `render.yaml`)
El archivo `render.yaml` en la raíz crea automáticamente `ritmoflow-db`.

### Opción B: Supabase
1. Crear proyecto en [supabase.com](https://supabase.com)
2. Copiar la **Connection string** (modo URI)
3. Usarla como `DATABASE_URL` en Render

## 2. Backend en Render

1. Conectar el repositorio GitHub en [render.com](https://render.com)
2. Crear **Blueprint** desde `render.yaml` o un **Web Service** manual:
   - **Build:** `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
   - **Start:** `gunicorn ritmoflow.wsgi --bind 0.0.0.0:$PORT`
3. Variables de entorno:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | URI de PostgreSQL |
| `DJANGO_SECRET_KEY` | Clave segura aleatoria |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `tu-api.onrender.com` |
| `CORS_ALLOW_ALL_ORIGINS` | `False` |
| `CORS_ALLOWED_ORIGINS` | `https://tu-app.vercel.app` |
| `FRONTEND_URL` | `https://tu-app.vercel.app` |

4. Tras el despliegue, cargar datos de prueba (opcional):
   ```bash
   python manage.py seed_data
   ```

## 3. Frontend en Vercel

1. Importar el repositorio en [vercel.com](https://vercel.com)
2. **Root Directory:** `frontend`
3. **Framework:** Vite
4. Variable de entorno:

| Variable | Valor |
|----------|-------|
| `VITE_API_URL` | `https://tu-api.onrender.com/api` |

5. El archivo `frontend/vercel.json` configura el enrutamiento SPA.

## 4. Desarrollo local

```bash
# Backend
cp .env.example .env   # configurar PostgreSQL local
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver

# Frontend
cd frontend
npm install
npm run dev
```

El proxy de Vite redirige `/api` → `http://localhost:8000` cuando `VITE_API_URL` está vacío.

## 5. Verificación post-despliegue

- [ ] `GET https://tu-api.onrender.com/api/auth/public-stats/` responde JSON
- [ ] Login con CAPTCHA funciona
- [ ] Catálogo carga coreografías
- [ ] CORS permite peticiones desde Vercel
- [ ] Checkout completa una compra de prueba

## Notas

- Render free tier puede tardar ~30s en despertar tras inactividad.
- Para email de recuperación de contraseña en producción, configurar `EMAIL_BACKEND` y credenciales SMTP en variables de entorno.
