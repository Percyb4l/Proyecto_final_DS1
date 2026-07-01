# Pruebas unitarias automatizadas — RITMOFLOW

Guía de las pruebas automatizadas del backend (Django + DRF).

## Ejecutar todas las pruebas

Desde la raíz del proyecto:

```powershell
python manage.py test
```

## Ejecutar por módulo

```powershell
python manage.py test users
python manage.py test cart
python manage.py test sales
python manage.py test choreographies
```

## Ejecutar un archivo específico

```powershell
python manage.py test users.tests_auth
python manage.py test users.tests_applications
python manage.py test users.tests_security
python manage.py test users.tests_internal_users
python manage.py test cart.tests
python manage.py test sales.tests
python manage.py test sales.tests_purchases
```

## Ejecutar un caso de prueba puntual

```powershell
python manage.py test users.tests_auth.RegisterTests.test_register_creates_client_user
```

## Resultado esperado

```
Ran 39 tests in ...
OK
```

---

## Archivos de prueba

| Archivo | Casos | Qué valida |
|---------|-------|------------|
| `users/tests_auth.py` | 7 | Registro de clientes, login con CAPTCHA, endpoint de CAPTCHA |
| `users/tests_applications.py` | 9 | Postulaciones de profesor: envío, aprobación, rechazo y permisos |
| `users/tests_internal_users.py` | 4 | Listado de usuarios (incluye clientes), filtros y creación de profesores |
| `users/tests_security.py` | 6 | Seguridad por rol, carrito ajeno, dashboards y escalación de privilegios |
| `cart/tests.py` | 5 | Agregar al carrito, duplicados, permisos y eliminación de ítems |
| `sales/tests.py` | 6 | Signals de `sales_count` en coreografías |
| `sales/tests_purchases.py` | 3 | Acceso a compras propias y progreso de videos |
| `choreographies/tests.py` | — | Reservado para pruebas del catálogo |

**Total actual:** 39 pruebas automatizadas.

---

## Detalle por archivo

### `users/tests_auth.py`

| Test | Descripción |
|------|-------------|
| `test_register_creates_client_user` | Registro exitoso devuelve JWT y crea rol `client` |
| `test_register_rejects_duplicate_email` | No permite correos duplicados |
| `test_register_rejects_password_mismatch` | Valida confirmación de contraseña |
| `test_login_with_valid_credentials_and_captcha` | Login exitoso con CAPTCHA válido |
| `test_login_rejects_invalid_captcha` | Rechaza CAPTCHA incorrecto |
| `test_login_rejects_wrong_password` | Rechaza contraseña inválida |
| `test_captcha_endpoint_returns_key_and_image` | Endpoint público de CAPTCHA |

### `users/tests_applications.py`

| Test | Descripción |
|------|-------------|
| `test_public_user_can_submit_application` | Cualquiera puede postularse |
| `test_duplicate_pending_email_is_rejected` | No duplica postulaciones pendientes |
| `test_director_can_list_applications` | Director ve postulaciones |
| `test_client_cannot_list_applications` | Cliente no accede al listado |
| `test_professor_cannot_submit_application` | Profesor no puede postularse |
| `test_approve_creates_professor_user` | Aprobar crea usuario profesor + perfil |
| `test_approve_converts_existing_client` | Aprobar convierte cliente existente |
| `test_reject_application` | Rechazar no crea usuario |
| `test_cannot_approve_already_reviewed_application` | No re-aprueba postulaciones revisadas |

### `users/tests_internal_users.py`

| Test | Descripción |
|------|-------------|
| `test_director_lists_clients_and_internal_users` | Listado incluye clientes e internos |
| `test_director_can_filter_users_by_role` | Filtro por rol `client` |
| `test_client_cannot_list_internal_users` | Cliente sin acceso al panel |
| `test_director_can_create_professor` | Creación manual de profesor |

### `users/tests_security.py`

| Test | Descripción |
|------|-------------|
| `test_me_endpoint_cannot_escalate_role` | PATCH `/me/` no cambia el rol |
| `test_cannot_remove_other_users_cart_item` | No elimina ítems ajenos del carrito |
| `test_professor_cannot_update_other_professors_choreography` | Ownership de coreografías |
| `test_client_cannot_access_admin_dashboard` | Cliente bloqueado en admin dashboard |
| `test_professor_cannot_access_client_dashboard` | Profesor bloqueado en client dashboard |
| `test_admin_dashboard_returns_structured_stats` | Estructura de métricas admin |

### `cart/tests.py`

| Test | Descripción |
|------|-------------|
| `test_client_can_add_item_to_cart` | Cliente agrega coreografía |
| `test_admin_cannot_add_to_cart` | Admin recibe 403 |
| `test_duplicate_item_is_rejected` | No duplica ítems en carrito |
| `test_client_can_view_cart_total` | Total y cantidad correctos |
| `test_client_can_remove_cart_item` | Eliminar ítem propio |

### `sales/tests.py`

| Test | Descripción |
|------|-------------|
| `test_sales_count_updates_when_sale_item_is_created` | Signal incrementa ventas |
| `test_sales_count_ignores_pending_sales` | Ignora ventas pendientes |
| `test_sales_count_updates_when_sale_is_completed` | Actualiza al completar venta |
| `test_sales_count_decreases_when_sale_item_is_deleted` | Decrementa al eliminar ítem |
| `test_sync_all_resets_counts_from_completed_sales` | Sincronización masiva |

### `sales/tests_purchases.py`

| Test | Descripción |
|------|-------------|
| `test_client_can_view_own_purchase` | Cliente ve sus videos comprados |
| `test_other_client_cannot_view_purchase` | No ve compras ajenas |
| `test_mark_video_watched_updates_progress` | Progreso de reproducción |

---

## Convenciones del proyecto

- Framework: `django.test.TestCase` para lógica de modelos/signals.
- API: `rest_framework.test.APITestCase` para endpoints REST.
- Autenticación en tests: `self.client.force_authenticate(user=...)`.
- URLs: `django.urls.reverse` con los nombres definidos en `urls.py`.

---

## Agregar nuevas pruebas

1. Crear o editar un archivo `tests_*.py` dentro de la app correspondiente.
2. Nombrar clases `*Tests` y métodos `test_*`.
3. Ejecutar `python manage.py test <app>` para validar.
4. Documentar el nuevo caso en este archivo.

Ejemplo mínimo:

```python
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

class MiFeatureTests(APITestCase):
    def test_endpoint_responde_ok(self):
        response = self.client.get('/api/health/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
```

---

## Notas

- Las pruebas usan una base de datos temporal que se crea y destruye automáticamente.
- No es necesario tener `seed_data` cargado para ejecutar los tests.
- Las pruebas del frontend (React) aún no están configuradas; esta guía cubre solo el backend.
