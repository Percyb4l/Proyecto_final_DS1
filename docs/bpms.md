# BPMs del proyecto RITMOFLOW

Documento de Business Process Models (BPMs).

## 1. Registro y autenticación de clientes

```mermaid
flowchart TD
    A[Visitante accede a /register] --> B[Completa formulario + CAPTCHA]
    B --> C{Datos válidos?}
    C -->|No| D[Muestra errores]
    D --> B
    C -->|Sí| E[API POST /auth/register/]
    E --> F[Crea User role=client]
    F --> G[Emite JWT access + refresh]
    G --> H[Redirige a dashboard cliente]
```



## 2. Compra de coreografías (checkout)

```mermaid
flowchart TD
    A[Cliente navega catálogo] --> B[Agrega al carrito]
    B --> C[API POST /cart/add/]
    C --> D[Carrito persistente en BD]
    D --> E[Checkout 4 pasos]
    E --> F[Paso 1: datos facturación]
    F --> G[Paso 2: método de pago simulado]
    G --> H[Paso 3: confirmación]
    H --> I[Paso 4: API POST /sales/checkout/]
    I --> J[Crea Sale + PurchaseAccess]
    J --> K[Incrementa sales_count]
    K --> L[Vacía carrito]
    L --> M[Cliente accede a videos comprados]
```





## 3. Gestión de coreografías (profesor / admin)

```mermaid
flowchart TD
    A[Profesor o Admin] --> B[Formulario nueva coreografía]
    B --> C[API POST /choreographies/]
    C --> D{Estado inicial}
    D -->|Profesor| E[pending]
    D -->|Admin/Director| F[published]
    E --> G[Admin revisa en panel]
    G --> H{Aprueba?}
    H -->|Sí| I[API POST approve → published]
    H -->|No| J[Rechazada / edición]
    I --> K[Visible en catálogo público]
```





## 4. Postulación y aprobación de profesores

```mermaid
flowchart TD
    A[Visitante /apply-professor] --> B[Envía postulación]
    B --> C[ProfessorApplication status=pending]
    C --> D[Admin/Director revisa]
    D --> E{Decisión}
    E -->|Aprobar| F[Crea o convierte User professor]
    F --> G[Crea ProfessorProfile]
    E -->|Rechazar| H[status=rejected + notas]
```





## 5. Recuperación de contraseña

```mermaid
flowchart TD
    A[Usuario olvidó contraseña] --> B[POST /auth/password-reset/]
    B --> C[Genera token + envía email]
    C --> D[Usuario abre enlace /reset-password]
    D --> E[POST /auth/password-reset/confirm/]
    E --> F[Actualiza contraseña]
```





## 6. Dashboard administrador

```mermaid
flowchart TD
    A[Admin/Director login] --> B[GET /auth/dashboard/admin/]
    B --> C[Totalizadores: usuarios, coreografías, ingresos]
    C --> D[Gráficas: ventas mensuales, registros, géneros]
    D --> E[Gestión usuarios / coreografías / ventas / postulaciones]
```





## Referencia de actores


| Actor         | Rol en sistema | Procesos principales                       |
| ------------- | -------------- | ------------------------------------------ |
| Visitante     | Sin sesión     | Registro, catálogo, postulación profesor   |
| Cliente       | `client`       | Compra, carrito, checkout, ver videos      |
| Profesor      | `professor`    | CRUD coreografías, dashboard métricas      |
| Director      | `director`     | Aprobaciones, usuarios, ventas             |
| Administrador | `admin`        | Mismo alcance que director + configuración |


