# Frontend

Aplicación React en `frontend/` con Vite y TypeScript.

## Estructura de carpetas

```
frontend/src/
├── App.tsx                 # Rutas y PrivateRoute
├── main.tsx                # Punto de entrada
├── index.css               # Estilos globales + Tailwind
├── context/
│   └── AuthContext.tsx     # Estado de sesión (user, login, logout)
├── services/
│   └── api.ts              # Axios + funciones por dominio
├── utils/
│   └── auth.ts             # getAccountPath, helpers
├── components/
│   ├── Navbar.tsx
│   ├── AdminLayout.tsx
│   ├── SocialLogin.tsx     # Botones decorativos (sin OAuth real)
│   └── layout/
│       ├── PublicLayout.tsx
│       └── DashboardLayout.tsx
└── pages/
    ├── LandingPage.tsx
    ├── CatalogPage.tsx
    ├── LoginPage.tsx
    ├── RegisterPage.tsx
    ├── ForgotPasswordPage.tsx
    ├── ResetPasswordPage.tsx
    ├── ProfilePage.tsx
    ├── CartPage.tsx
    ├── CheckoutPage.tsx
    ├── ClientDashboardPage.tsx
    ├── PurchaseViewPage.tsx
    ├── ProfessorDashboardPage.tsx
    ├── AdminDashboardPage.tsx
    ├── AdminUsersPage.tsx
    ├── AdminChoreographiesPage.tsx
    ├── ChoreographyFormPage.tsx
    ├── AdminSalesPage.tsx
    ├── AdminProfessorsPage.tsx
    └── AdminSettingsPage.tsx
```

## Rutas y protección

Definidas en `App.tsx`. El componente `PrivateRoute`:

1. Espera a que `AuthContext` cargue el usuario (`/auth/me/`)
2. Redirige a `/login` si no hay sesión
3. Redirige al dashboard del rol si el usuario no tiene permiso

## Servicios API (`api.ts`)

Cliente Axios con:

- `baseURL: '/api'`
- Interceptor que añade JWT desde `localStorage`
- En 401: limpia sesión y redirige a login

Módulos exportados:

| Módulo | Uso |
|--------|-----|
| `authApi` | Login, registro, perfil, reset password |
| `choreoApi` | CRUD coreografías, featured, hot_sales, approve |
| `cartApi` | Carrito |
| `salesApi` | Checkout, compras, progreso de videos |
| `dashboardApi` | Métricas admin y cliente |
| `usersApi` | Usuarios internos y profesores |

## Páginas principales

### Públicas

- **LandingPage:** hero, coreografías destacadas, CTA al catálogo
- **CatalogPage:** grid filtrable de coreografías publicadas
- **LoginPage:** email, contraseña, CAPTCHA
- **RegisterPage:** formulario de cliente con CAPTCHA
- **ForgotPasswordPage / ResetPasswordPage:** flujo de recuperación

### Cliente

- **CartPage:** ítems del carrito; botón ir a checkout
- **CheckoutPage:** 4 pasos (resumen → datos → pago → confirmación)
- **ClientDashboardPage:** compras, progreso, acceso a reproductor
- **PurchaseViewPage:** reproductor de videos del paquete comprado
- **ProfilePage:** edición de datos personales

### Profesor

- **ProfessorDashboardPage:** métricas y acceso a gestión de coreografías

### Admin / Director

- **AdminDashboardPage:** gráficas Recharts con datos reales del API
- **AdminUsersPage:** CRUD usuarios internos
- **AdminChoreographiesPage:** listado, filtros, aprobar
- **ChoreographyFormPage:** crear/editar con videos embebidos
- **AdminSalesPage:** historial de ventas
- **AdminProfessorsPage:** listado de profesores
- **AdminSettingsPage:** configuración del panel

## Diseño visual

- Tema oscuro (`#1A1A1A` fondo)
- Acentos: naranja `#FF6B1A`, fucsia `#E91E8C`, crema `#FFF8F0`
- Tailwind CSS para utilidades y responsive
- Emojis como thumbnails de coreografías

## Desarrollo

```powershell
cd frontend
npm install
npm run dev      # http://localhost:5173
npm run build    # producción en dist/
npm run preview  # previsualizar build
```

### Proxy de desarrollo

Vite (`vite.config.ts`) redirige `/api` → `http://localhost:8000`, evitando problemas de CORS en local.

## Estado de autenticación

`AuthContext` al montar:

1. Lee `access` de `localStorage`
2. Si existe, llama `GET /auth/me/`
3. Expone `user`, `login`, `logout`, `loading`

El token se guarda en login exitoso y se elimina en logout o 401.
