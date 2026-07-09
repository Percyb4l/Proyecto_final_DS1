# Despliegue en la nube — RITMOFLOW

Stack: **Supabase** (PostgreSQL) + **Render** (Django API) + **Vercel** (React).

```
[Vercel — React]  →  HTTPS  →  [Render — Django]  →  [Supabase — PostgreSQL]
```

---

## Paso 1 — Supabase (base de datos)

1. Entra a [supabase.com](https://supabase.com) → **New project**
2. Nombre: `ritmoflow`, región cercana (ej. South America), contraseña segura
3. Espera a que el proyecto esté listo (~2 min)
4. **Project Settings → Database → Connection string**
5. Elige **URI** y modo **Session pooler** (puerto **5432**)
6. Copia la URL (reemplaza `[YOUR-PASSWORD]` por tu contraseña)

Ejemplo:
```
postgresql://postgres.xxxxx:TU_PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

7. Carga el esquema y datos de prueba (en tu PC):

```powershell
cd F:\Proyecto_final_DS1
$env:DATABASE_URL = "postgresql://..."   # tu URI de Supabase
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
```

---

## Paso 2 — Render (backend)

1. Entra a [render.com](https://render.com) → conecta GitHub
2. **New → Blueprint** → selecciona `Proyecto_final_DS1`
3. Render lee `render.yaml` y crea el servicio `ritmoflow-api`
4. Al desplegar, configura estas variables:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | URI de Supabase (paso 1) |
| `DJANGO_SECRET_KEY` | Clave aleatoria larga |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `ritmoflow-api.onrender.com` |
| `CORS_ALLOW_ALL_ORIGINS` | `False` |
| `CORS_ALLOWED_ORIGINS` | `https://TU-APP.vercel.app` *(después del paso 3)* |
| `FRONTEND_URL` | `https://TU-APP.vercel.app` |

5. Verifica el API:
```
https://ritmoflow-api.onrender.com/api/health/
```
Debe responder: `{"status":"ok","app":"RITMOFLOW"}`

> Si no usaste `seed_data` en el paso 1, en Render → **Shell**:
> `python manage.py seed_data`

---

## Paso 3 — Vercel (frontend)

1. Entra a [vercel.com](https://vercel.com) → **Add New Project**
2. Importa el repo de GitHub
3. Configuración:

| Campo | Valor |
|-------|-------|
| Root Directory | `frontend` |
| Framework | Vite |

4. Variable de entorno:

| Variable | Valor |
|----------|-------|
| `VITE_API_URL` | `https://ritmoflow-api.onrender.com/api` |

5. **Deploy**

6. Copia la URL de Vercel (ej. `https://proyecto-final-ds1.vercel.app`) y actualiza en **Render**:
   - `CORS_ALLOWED_ORIGINS`
   - `FRONTEND_URL`

---

## Paso 4 — Verificación

- [ ] `GET .../api/health/` → OK
- [ ] `GET .../api/auth/public-stats/` → JSON con estadísticas
- [ ] Landing carga en Vercel
- [ ] Login con CAPTCHA (`admin@ritmoflow.com` / `admin123`)
- [ ] Catálogo y carrito funcionan

---

## Script automático (opcional)

```powershell
$env:DATABASE_URL = "postgresql://..."      # Supabase
$env:VERCEL_TOKEN = "..."                   # vercel.com/account/tokens
$env:VITE_API_URL = "https://ritmoflow-api.onrender.com/api"
.\scripts\deploy.ps1
```

---

## Notas

- **Render free:** el servidor puede tardar ~30 s en despertar tras inactividad.
- **Supabase free:** 500 MB de BD, suficiente para el proyecto.
- **Correos:** configurar SMTP en Render para recuperación de contraseña en producción.
- Variables de ejemplo: `.env.production.example`
