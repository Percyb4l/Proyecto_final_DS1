# Documentación técnica — RITMOFLOW

Índice de la documentación del proyecto.

| Documento | Descripción |
|-----------|-------------|
| [instalacion.md](instalacion.md) | Requisitos, variables de entorno y puesta en marcha |
| [arquitectura.md](arquitectura.md) | Visión general, capas y comunicación entre componentes |
| [modelos.md](modelos.md) | Esquema de base de datos y relaciones entre entidades |
| [api.md](api.md) | Endpoints REST, métodos, permisos y ejemplos |
| [roles-y-permisos.md](roles-y-permisos.md) | Matriz de capacidades por rol de usuario |
| [frontend.md](frontend.md) | Estructura React, rutas, servicios y componentes |
| [flujos.md](flujos.md) | Flujos de negocio principales (compra, aprobación, etc.) |

## Resumen del sistema

RITMOFLOW es una plataforma de e-commerce educativo para una academia de baile en línea. Los **clientes** compran paquetes de videos (coreografías); los **profesores** crean contenido que debe ser **aprobado** por Admin/Director antes de publicarse; los **administradores** gestionan usuarios, ventas y el catálogo.

**Backend:** Django REST Framework en `http://localhost:8000`  
**Frontend:** React + Vite en `http://localhost:5173` (proxy `/api` → backend)  
**Autenticación:** JWT (Bearer token en header `Authorization`)
