# Modelos de datos

## Diagrama de relaciones (resumen)

```
User ──┬── ProfessorProfile (1:1, solo profesores)
       ├── Cart (1:1, clientes)
       ├── Sale (1:N)
       └── PurchaseAccess (1:N)

Choreography ──┬── ChoreographyVideo (1:N)
               ├── main_professor → User
               ├── guest_professor → User (opcional)
               └── CartItem / SaleItem

Sale ── SaleItem (1:N) ── Choreography
Sale ── PurchaseAccess (1:N)
```

## User (`users.User`)

Extiende `AbstractUser`. Modelo de autenticación personalizado (`AUTH_USER_MODEL`).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `role` | choice | `admin`, `director`, `professor`, `client` |
| `document_type` | choice | CC, CE, TI, PP |
| `document_number` | string | Único |
| `gender` | choice | M, F, O |
| `birth_date` | date | Opcional |
| `phone` | string | |
| `billing_address` | text | |
| `city`, `department`, `country` | string | Dirección de facturación |

## ProfessorProfile

| Campo | Descripción |
|-------|-------------|
| `user` | OneToOne → User |
| `expertise` | Estilos que enseña |
| `bio` | Reseña profesional |
| `hire_date` | Fecha de registro |

## Choreography

| Campo | Descripción |
|-------|-------------|
| `title` | Nombre de la coreografía |
| `song_name` | Canción |
| `genre` | salsa, bachata, merengue, hip_hop, pop, reggaeton, contemporaneo |
| `difficulty` | basic, intermediate, advanced |
| `main_professor` | FK → User (profesor principal) |
| `guest_professor` | FK → User interno invitado (opcional) |
| `guest_professor_external` | Nombre de profesor externo (opcional) |
| `price` | Precio del paquete (COP) |
| `sales_count` | **Solo lectura** — calculado por signals |
| `status` | draft, pending, published, rejected |
| `thumbnail_emoji` | Emoji para UI |
| `rating` | Calificación promedio |

## ChoreographyVideo

Cada coreografía es un **paquete de videos** (típicamente 3–4 partes).

| Campo | Descripción |
|-------|-------------|
| `choreography` | FK → Choreography |
| `part_number` | Número de parte (único por coreografía) |
| `title` | Título del video |
| `video_url` | URL del video |
| `duration_seconds` | Duración |

## Cart / CartItem

- Un **Cart** por cliente (`OneToOne` con User)
- **CartItem**: coreografía en carrito; `unique_together (cart, choreography)`

## Sale / SaleItem / PurchaseAccess

### Sale

| Campo | Descripción |
|-------|-------------|
| `client` | Comprador |
| `total_amount` | Total con IVA incluido |
| `payment_method` | `card` o `pse` |
| `status` | pending, completed, cancelled |
| `billing_*` | Datos de facturación snapshot |

### SaleItem

Snapshot del ítem vendido (`choreography_title`, `price` al momento de la venta).

### PurchaseAccess

Acceso del cliente a una coreografía comprada.

| Campo | Descripción |
|-------|-------------|
| `videos_watched` | Partes vistas (progreso) |
| `progress_percent` | Propiedad calculada (0–100%) |
| `unique_together` | (client, choreography) |
