# Plan de pruebas — RITMOFLOW

Guía para validar el funcionamiento del sistema (pruebas manuales y automatizadas).

## Requisitos previos

1. PostgreSQL en ejecución con la base de datos `ritmoflow`.
2. Archivo `.env` configurado en la raíz del proyecto.
3. Backend corriendo:

```powershell
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

4. Frontend corriendo:

```powershell
cd frontend
npm install
npm run dev
```

5. Abrir **http://localhost:5173**

### Usuarios de prueba (`seed_data`)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | admin@ritmoflow.com | admin123 |
| Director | director@ritmoflow.com | admin123 |
| Profesor | carlos.prof@ritmoflow.com | admin123 |
| Cliente | ana@ritmoflow.com | admin123 |

### Verificación rápida del API

| Prueba | Comando / URL | Resultado esperado |
|--------|---------------|-------------------|
| Salud del servidor | `GET http://localhost:8000/api/health/` | `{"status":"ok","app":"RITMOFLOW"}` |

---

## Pruebas automatizadas (backend)

Ejecutar desde la raíz del proyecto:

```powershell
python manage.py test
```

**Resultado esperado:** `Ran 39 tests` → `OK`

Documentación detallada: [pruebas-unitarias.md](pruebas-unitarias.md)

### Cobertura actual

| Módulo | Archivo | Qué valida |
|--------|---------|------------|
| Autenticación | `users/tests_auth.py` | Registro, login, CAPTCHA |
| Postulaciones | `users/tests_applications.py` | Flujo completo de profesores |
| Usuarios admin | `users/tests_internal_users.py` | Listado, filtros, creación |
| Seguridad | `users/tests_security.py` | Roles, carrito ajeno, dashboards |
| Carrito | `cart/tests.py` | Agregar, eliminar, permisos |
| Ventas | `sales/tests.py` | Contador `sales_count` con signals |
| Compras | `sales/tests_purchases.py` | Acceso a compras y progreso de videos |

---

## Pruebas manuales — Autenticación

### AUTH-01 — Login exitoso con CAPTCHA

| Campo | Detalle |
|-------|---------|
| **Rol** | Cualquiera |
| **Pasos** | 1. Ir a `/login`. 2. Ingresar email y contraseña válidos. 3. Completar CAPTCHA. 4. Clic en "Iniciar sesión". |
| **Esperado** | Redirección al dashboard según rol (cliente → `/dashboard`, admin → `/admin`, profesor → `/professor`). |

### AUTH-02 — Login con CAPTCHA incorrecto

| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Ir a `/login`. 2. Ingresar credenciales válidas. 3. Escribir CAPTCHA incorrecto. |
| **Esperado** | Mensaje de error. No inicia sesión. Se recarga el CAPTCHA. |

### AUTH-03 — Registro de cliente

| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Ir a `/register`. 2. Completar todos los campos con datos nuevos. 3. Confirmar contraseña igual. 4. Enviar formulario. |
| **Esperado** | Cuenta creada. Redirección a `/dashboard`. Usuario con rol `client`. |

### AUTH-04 — Registro con email duplicado

| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Intentar registrarse con `ana@ritmoflow.com`. |
| **Esperado** | Mensaje de error claro (no solo una letra suelta). No se crea la cuenta. |

### AUTH-05 — Recuperación de contraseña

| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Ir a `/forgot-password`. 2. Ingresar email existente. 3. Revisar consola del backend. 4. Abrir enlace de reset. 5. Definir nueva contraseña. |
| **Esperado** | Enlace aparece en la terminal de `runserver`. Nueva contraseña funciona en login. |

### AUTH-06 — Cerrar sesión

| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Iniciar sesión como cliente. 2. Clic en "Cerrar sesión" en el Navbar. |
| **Esperado** | Sesión eliminada. Redirección al inicio. Rutas privadas redirigen a login. |

---

## Pruebas manuales — Catálogo y carrito

### CAT-01 — Ver catálogo público

| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Ir a `/catalog` sin iniciar sesión. |
| **Esperado** | Se listan coreografías publicadas con precio, género y profesor. |

### CAT-02 — Filtros y búsqueda

| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Filtrar por género (ej. Salsa). 2. Buscar por nombre. 3. Cambiar ordenamiento. |
| **Esperado** | La lista se actualiza según filtros seleccionados. |

### CAT-03 — Agregar al carrito como cliente

| Campo | Detalle |
|-------|---------|
| **Precondición** | Sesión iniciada como `ana@ritmoflow.com` |
| **Pasos** | 1. Ir a `/catalog`. 2. Clic en "Agregar al carrito". |
| **Esperado** | Mensaje de éxito. Ítem visible en `/cart`. |

### CAT-04 — Agregar al carrito como admin/profesor

| Campo | Detalle |
|-------|---------|
| **Precondición** | Sesión iniciada como `admin@ritmoflow.com` |
| **Pasos** | 1. Ir a `/catalog`. 2. Clic en "Agregar al carrito". |
| **Esperado** | Mensaje indicando que solo clientes pueden comprar. No se agrega al carrito. |

### CAT-05 — Carrito sin sesión

| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Sin login, intentar agregar al carrito. |
| **Esperado** | Redirección a `/login`. |

---

## Pruebas manuales — Checkout y compras

### SALE-01 — Checkout completo

| Campo | Detalle |
|-------|---------|
| **Precondición** | Cliente con ítems en el carrito |
| **Pasos** | 1. Ir a `/cart`. 2. Ir a checkout. 3. Completar los 4 pasos. 4. Confirmar compra. |
| **Esperado** | Venta completada. Carrito vacío. Acceso a coreografías compradas. |

### SALE-02 — Ver compras en dashboard

| Campo | Detalle |
|-------|---------|
| **Precondición** | Cliente con al menos una compra |
| **Pasos** | 1. Ir a `/dashboard`. |
| **Esperado** | Métricas, gráficas y listado de compras visibles. |

### SALE-03 — Reproductor de videos

| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Desde el dashboard, abrir una compra. 2. Reproducir un video. |
| **Esperado** | Videos cargan. El progreso se actualiza al marcar como visto. |

### SALE-04 — Reporte de ventas (admin)

| Campo | Detalle |
|-------|---------|
| **Precondición** | Sesión como admin o director |
| **Pasos** | 1. Ir a `/admin/sales`. |
| **Esperado** | Pantalla carga correctamente (no pantalla negra). Métricas, gráfica y tabla de transacciones visibles. |

---

## Pruebas manuales — Coreografías

### CHO-01 — Profesor crea coreografía

| Campo | Detalle |
|-------|---------|
| **Precondición** | Sesión como `carlos.prof@ritmoflow.com` |
| **Pasos** | 1. Ir a `/admin/choreographies/new`. 2. Completar datos y videos. 3. Guardar. |
| **Esperado** | Coreografía creada en estado pendiente o borrador. |

### CHO-02 — Admin aprueba coreografía

| Campo | Detalle |
|-------|---------|
| **Precondición** | Coreografía pendiente de aprobación |
| **Pasos** | 1. Iniciar sesión como admin. 2. Ir a `/admin/choreographies`. 3. Aprobar. |
| **Esperado** | Estado `published`. Aparece en el catálogo público. |

### CHO-03 — Profesor no edita coreografía ajena

| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Iniciar sesión como profesor B. 2. Intentar editar coreografía del profesor A (vía API o UI si expuesta). |
| **Esperado** | Acceso denegado (403 o 404). |

---

## Pruebas manuales — Gestión de usuarios

### USR-01 — Listar todos los usuarios

| Campo | Detalle |
|-------|---------|
| **Precondición** | Sesión como admin o director |
| **Pasos** | 1. Ir a `/admin/users`. |
| **Esperado** | Se muestran admin, director, profesores **y clientes**. |

### USR-02 — Crear usuario interno

| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Clic en "Nuevo". 2. Crear un profesor con especialidad. |
| **Esperado** | Usuario aparece en la tabla. Puede iniciar sesión. |

### USR-03 — Filtrar por rol cliente

| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. En filtro de roles, seleccionar "Cliente". |
| **Esperado** | Solo se listan usuarios con rol cliente. |

---

## Pruebas manuales — Postulaciones de profesor

### APP-01 — Enviar postulación pública

| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Ir a `/apply-professor`. 2. Completar formulario con email nuevo. 3. Enviar. |
| **Esperado** | Mensaje de éxito. Postulación queda pendiente. |

### APP-02 — Postulación duplicada pendiente

| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Enviar otra postulación con el mismo email mientras la anterior está pendiente. |
| **Esperado** | Error indicando que ya existe una postulación pendiente. |

### APP-03 — Director revisa postulaciones

| Campo | Detalle |
|-------|---------|
| **Precondición** | Sesión como `director@ritmoflow.com` |
| **Pasos** | 1. Ir a `/admin/applications`. 2. Ver detalle de postulación pendiente. |
| **Esperado** | Lista y panel de detalle cargan correctamente. |

### APP-04 — Aprobar postulación

| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Seleccionar postulación pendiente. 2. Definir contraseña. 3. Clic en "Aprobar". |
| **Esperado** | Postulación marcada como aprobada. El candidato puede iniciar sesión como profesor y acceder a `/professor`. |

### APP-05 — Rechazar postulación

| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Seleccionar postulación pendiente. 2. Escribir comentario. 3. Clic en "Rechazar". |
| **Esperado** | Postulación marcada como rechazada. No se crea usuario profesor. |

### APP-06 — Cliente logueado postula

| Campo | Detalle |
|-------|---------|
| **Precondición** | Sesión como cliente |
| **Pasos** | 1. Ir a `/apply-professor`. 2. Enviar postulación. |
| **Esperado** | Formulario prellenado con datos del cliente. Postulación vinculada al usuario. |

---

## Pruebas manuales — Seguridad y permisos

### SEC-01 — Cliente no accede al panel admin

| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Iniciar sesión como cliente. 2. Navegar manualmente a `/admin`. |
| **Esperado** | Redirección al dashboard del cliente. |

### SEC-02 — Profesor no accede a ventas

| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Iniciar sesión como profesor. 2. Navegar a `/admin/sales`. |
| **Esperado** | Redirección a `/professor`. |

### SEC-03 — Token expirado o inválido

| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Iniciar sesión. 2. Borrar o corromper `access` en `localStorage`. 3. Intentar acceder a `/cart`. |
| **Esperado** | Redirección a `/login`. |

### SEC-04 — Cliente no edita su propio rol

| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Iniciar sesión como cliente. 2. Ir a `/profile`. 3. Verificar que el rol no es editable. |
| **Esperado** | El rol se muestra pero no se puede cambiar a admin. |

---

## Pruebas manuales — Dashboards

### DASH-01 — Dashboard admin

| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Iniciar sesión como admin. 2. Ir a `/admin`. |
| **Esperado** | Totalizadores y gráficas Recharts cargan sin errores. |

### DASH-02 — Dashboard profesor

| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Iniciar sesión como profesor. 2. Ir a `/professor`. |
| **Esperado** | Coreografías, ventas e ingresos del profesor visibles. |

### DASH-03 — Dashboard cliente

| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Iniciar sesión como cliente. 2. Ir a `/dashboard`. |
| **Esperado** | Compras, progreso, gráficas y recomendaciones visibles. |

---

## Checklist de regresión rápida

Usar antes de entregar o exponer el proyecto:

- [ ] `python manage.py test` pasa sin errores
- [ ] `GET /api/health/` responde OK
- [ ] Login con CAPTCHA funciona
- [ ] Registro de cliente funciona
- [ ] Catálogo carga coreografías
- [ ] Cliente agrega al carrito y completa checkout
- [ ] Admin ve ventas sin pantalla negra
- [ ] Admin ve clientes en gestión de usuarios
- [ ] Postulación de profesor se envía y el director puede aprobar/rechazar
- [ ] Cerrar sesión funciona desde el Navbar
- [ ] Rutas protegidas bloquean roles incorrectos

---

## Plantilla para reportar un bug

```text
ID de prueba: (ej. CAT-03)
Fecha:
Probado por:
Navegador:
Rol usado:

Pasos realizados:
1.
2.
3.

Resultado esperado:

Resultado obtenido:

Captura / error en consola (si aplica):
```

---

## Notas

- En desarrollo, los correos de recuperación de contraseña se imprimen en la consola del backend, no en un buzón real.
- El pago en checkout es **simulado**; la venta se marca como completada al finalizar.
- Si el frontend no carga datos, verificar que el backend esté en el puerto **8000** y el frontend en **5173**.
