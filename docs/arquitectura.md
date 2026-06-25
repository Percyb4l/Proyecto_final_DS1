# Arquitectura del sistema

## Visión general

```
┌─────────────────┐     HTTP/JSON      ┌─────────────────┐     SQL      ┌──────────────┐
│  React (Vite)   │ ◄────────────────► │  Django REST    │ ◄──────────► │  PostgreSQL  │
│  localhost:5173 │   JWT Bearer       │  localhost:8000 │              │  ritmoflow   │
└─────────────────┘                    └─────────────────┘              └──────────────┘
```

## Capas

### Frontend (`frontend/`)

- **React 19** con TypeScript
- **Vite** como bundler y servidor de desarrollo
- **Tailwind CSS** para estilos
- **Recharts** para gráficas en dashboards
- **Axios** para consumo del API (`src/services/api.ts`)
- **React Router** para navegación
- **Context API** para estado de autenticación (`AuthContext`)

### Backend (`ritmoflow/` + apps Django)

| App | Responsabilidad |
|-----|-----------------|
| `users` | Usuarios, autenticación JWT, CAPTCHA, dashboards, usuarios internos |
| `choreographies` | Catálogo, videos por parte, aprobación de publicación |
| `cart` | Carrito persistente por cliente |
| `sales` | Checkout, ventas, acceso a compras, signals de `sales_count` |

### Base de datos

PostgreSQL con migraciones Django. No se usa SQLite en producción.

## Autenticación

1. El cliente envía `POST /api/auth/login/` con email, contraseña y CAPTCHA
2. El servidor devuelve `access` y `refresh` (JWT)
3. El frontend guarda el token en `localStorage`
4. Axios intercepta peticiones y añade `Authorization: Bearer <access>`
5. Token de acceso expira en 24 horas

## Seguridad

- Permisos por rol (`IsAdminOrDirector`, `IsClient`, `IsProfessorOwnerOrAdmin`)
- Recursos filtrados por `request.user` (carrito, compras, perfil)
- `sales_count` en coreografías no editable manualmente; se actualiza vía **Django Signals** al completar ventas
- Campo `role` de solo lectura en endpoint `/api/auth/me/`

## Signals (ventas)

En `sales/signals.py`:

- `post_save` / `post_delete` en `SaleItem` → recalcula `sales_count` de la coreografía
- `post_save` en `Sale` → sincroniza contadores al cambiar estado de la venta

Solo cuentan ítems de ventas con `status=completed`.

## Estructura de carpetas backend

```
ritmoflow/
├── settings.py      # Configuración global, JWT, CORS, email
├── urls.py          # Rutas raíz /api/*
└── wsgi.py

users/
├── models.py        # User, ProfessorProfile
├── views.py         # Auth, dashboards, usuarios internos
├── serializers.py
├── permissions.py
└── urls.py

choreographies/
├── models.py        # Choreography, ChoreographyVideo
├── views.py         # ViewSet CRUD + approve, featured, hot_sales
└── serializers.py

cart/
├── models.py        # Cart, CartItem
└── views.py

sales/
├── models.py        # Sale, SaleItem, PurchaseAccess
├── views.py         # checkout, purchases, watch progress
├── signals.py
└── serializers.py
```
