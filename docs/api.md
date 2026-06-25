# API REST

Base URL: `http://localhost:8000/api`

Autenticación: header `Authorization: Bearer <access_token>` (excepto endpoints marcados como públicos).

## Salud

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/health/` | No | Estado del servidor |

```json
{ "status": "ok", "app": "RITMOFLOW" }
```

---

## Autenticación (`/auth/`)

### CAPTCHA

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/auth/captcha/` | No | Obtiene imagen y clave CAPTCHA |

Respuesta: `{ "captcha_key": "...", "captcha_image": "/api/captcha/image/..." }`

### Registro de cliente

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/register/` | No | Registra un nuevo cliente |

Campos principales: `email`, `password`, `first_name`, `last_name`, `document_type`, `document_number`, `phone`, `captcha_key`, `captcha_value`.

### Login

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/login/` | No | Inicio de sesión JWT |

Body: `email`, `password`, `captcha_key`, `captcha_value`

Respuesta: `{ "access": "...", "refresh": "...", "user": { ... } }`

### Perfil actual

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/auth/me/` | Sí | Datos del usuario autenticado |
| PATCH | `/auth/me/` | Sí | Actualizar perfil (rol no editable) |

### Recuperación de contraseña

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/password-reset/` | No | Solicitar enlace por email |
| POST | `/auth/password-reset/confirm/` | No | Confirmar nueva contraseña |

**Request reset:** `{ "email": "usuario@ejemplo.com" }`

**Confirm:** `{ "uid": "...", "token": "...", "password": "nueva_clave" }`

### Dashboards

| Método | Ruta | Auth | Rol |
|--------|------|------|-----|
| GET | `/auth/dashboard/admin/` | Sí | admin, director |
| GET | `/auth/dashboard/client/` | Sí | client |

**Admin dashboard** incluye: totalizadores (usuarios, coreografías, ingresos, ventas, ticket promedio), series mensuales de ventas/registros, top coreografías y distribución por género.

**Client dashboard** incluye: compras recientes, progreso y estadísticas del cliente.

### Usuarios internos

| Método | Ruta | Auth | Rol |
|--------|------|------|-----|
| GET | `/auth/internal/` | Sí | admin, director |
| POST | `/auth/internal/` | Sí | admin, director |
| GET | `/auth/internal/{id}/` | Sí | admin, director |
| PATCH | `/auth/internal/{id}/` | Sí | admin, director |
| DELETE | `/auth/internal/{id}/` | Sí | admin, director |

Roles permitidos al crear: `admin`, `director`, `professor`.

### Profesores

| Método | Ruta | Auth | Rol |
|--------|------|------|-----|
| GET | `/auth/professors/` | Sí | admin, director |

Listado de profesores con perfil (`ProfessorProfile`).

---

## Coreografías (`/choreographies/`)

ViewSet REST estándar + acciones personalizadas.

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/choreographies/` | Sí* | Listar (filtrado por rol) |
| POST | `/choreographies/` | Sí | Crear coreografía |
| GET | `/choreographies/{id}/` | Sí | Detalle |
| PATCH | `/choreographies/{id}/` | Sí | Actualizar |
| DELETE | `/choreographies/{id}/` | Sí | Eliminar |
| POST | `/choreographies/{id}/approve/` | Sí | Publicar (admin/director) |
| GET | `/choreographies/featured/` | No | Top 4 publicadas |
| GET | `/choreographies/hot_sales/` | No | Top 6 por ventas |

\* Listado público en catálogo usa coreografías `published`. Profesor solo ve las suyas. Admin/Director ven todas.

**Filtros query:** `genre`, `difficulty`, `search`, `status` (admin/director).

**Crear/editar** incluye array `videos`: `[{ "part_number", "title", "video_url", "duration_seconds" }]`.

---

## Carrito (`/cart/`)

| Método | Ruta | Auth | Rol |
|--------|------|------|-----|
| GET | `/cart/` | Sí | client |
| POST | `/cart/add/` | Sí | client |
| DELETE | `/cart/items/{item_id}/` | Sí | client |
| DELETE | `/cart/clear/` | Sí | client |

**Agregar:** `{ "choreography_id": 1 }`

---

## Ventas (`/sales/`)

| Método | Ruta | Auth | Rol |
|--------|------|------|-----|
| POST | `/sales/checkout/` | Sí | client |
| GET | `/sales/my/` | Sí | client |
| GET | `/sales/purchases/` | Sí | client |
| GET | `/sales/purchases/{id}/` | Sí | client |
| POST | `/sales/purchases/{id}/watch/` | Sí | client |
| GET | `/sales/all/` | Sí | admin, director |

### Checkout

```json
{
  "payment_method": "card",
  "billing_name": "Ana García",
  "billing_email": "ana@ritmoflow.com",
  "billing_phone": "3001234567",
  "billing_address": "Calle 10 #5-20",
  "city": "Cali",
  "department": "Valle del Cauca",
  "country": "Colombia"
}
```

- Calcula **IVA 19%** sobre el subtotal del carrito
- Crea `Sale` con estado `completed`
- Crea `PurchaseAccess` por cada ítem
- Vacía el carrito
- Respuesta incluye `sale` y `purchases` (resumen para redirección)

### Marcar video visto

`POST /sales/purchases/{id}/watch/`

```json
{ "part_number": 1 }
```

Actualiza `videos_watched` si `part_number` es mayor al valor actual.

---

## Códigos de error comunes

| Código | Significado |
|--------|-------------|
| 400 | Datos inválidos o carrito vacío |
| 401 | Token ausente o expirado |
| 403 | Rol sin permiso para el recurso |
| 404 | Recurso no encontrado |
