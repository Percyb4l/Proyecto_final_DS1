# Roles y permisos

## Roles del sistema

| Rol | Código | Descripción |
|-----|--------|-------------|
| Administrador | `admin` | Control total: usuarios, ventas, catálogo |
| Director | `director` | Igual que admin en gestión operativa |
| Profesor bailarín | `professor` | Crea y edita sus coreografías |
| Cliente | `client` | Compra y consume contenido |

## Matriz de capacidades

| Capacidad | Admin | Director | Profesor | Cliente | Público |
|-----------|:-----:|:--------:|:--------:|:-------:|:-------:|
| Ver landing y catálogo publicado | ✓ | ✓ | ✓ | ✓ | ✓ |
| Registrarse | — | — | — | ✓ | ✓ |
| Login con CAPTCHA | ✓ | ✓ | ✓ | ✓ | ✓ |
| Recuperar contraseña | ✓ | ✓ | ✓ | ✓ | — |
| Editar perfil propio | ✓ | ✓ | ✓ | ✓ | — |
| Carrito y checkout | — | — | — | ✓ | — |
| Ver videos comprados | — | — | — | ✓ | — |
| Dashboard cliente | — | — | — | ✓ | — |
| Crear coreografías | ✓ | ✓ | ✓ | — | — |
| Editar coreografías propias | ✓ | ✓ | ✓ | — | — |
| Editar cualquier coreografía | ✓ | ✓ | — | — | — |
| Aprobar/publicar coreografías | ✓ | ✓ | — | — | — |
| Dashboard profesor | — | — | ✓ | — | — |
| Gestionar usuarios internos | ✓ | ✓ | — | — | — |
| Ver todas las ventas | ✓ | ✓ | — | — | — |
| Dashboard admin | ✓ | ✓ | — | — | — |

## Clases de permiso (backend)

Definidas en `users/permissions.py`:

### `IsAdminOrDirector`

Usado en: usuarios internos, ventas globales, dashboard admin, aprobación de coreografías.

### `IsClient`

Usado en: carrito, checkout, compras, dashboard cliente.

### `IsAdminDirectorOrProfessor`

Usado en: listado extendido de coreografías en panel admin.

### `IsProfessorOwnerOrAdmin`

Permiso a nivel de objeto en coreografías:

- Admin y Director: acceso total
- Profesor: solo si `main_professor == request.user`

## Reglas de visibilidad de coreografías

| Rol | Coreografías visibles en API |
|-----|------------------------------|
| Público / no autenticado | Solo `published` (featured, hot_sales) |
| Cliente | Solo `published` |
| Profesor | Solo las creadas por él (`main_professor`) |
| Admin / Director | Todas (draft, pending, published, rejected) |

## Seguridad del perfil

- El endpoint `PATCH /auth/me/` usa `MeProfileSerializer`
- El campo `role` es **solo lectura** — un cliente no puede elevarse a admin
- Tests en `users/tests_security.py` validan estas restricciones

## Redirección en frontend

Tras login, `getAccountPath(role)` envía a:

| Rol | Ruta |
|-----|------|
| admin, director | `/admin` |
| professor | `/professor` |
| client | `/dashboard` |

`PrivateRoute` bloquea rutas si el rol del usuario no está en la lista permitida.
