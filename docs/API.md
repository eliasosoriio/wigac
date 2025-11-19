# API Documentation - Wigac

## 🔗 Base URL

```
http://localhost:3001/api
```

## 🔐 Autenticación

La mayoría de endpoints requieren autenticación JWT. Incluye el token en el header:

```http
Authorization: Bearer <tu_jwt_token>
```

---

## 📋 Autenticación

### Registro de Usuario

**POST** `/auth/register`

Registra un nuevo usuario en el sistema.

**Request Body:**
```json
{
  "email": "usuario@example.com",
  "password": "password123",
  "name": "Nombre Usuario"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "name": "Nombre Usuario",
    "role": "USER",
    "createdAt": "2024-01-15T10:00:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores:**
- `400 Bad Request`: Email ya existe o datos inválidos
- `422 Unprocessable Entity`: Validación fallida

---

### Iniciar Sesión

**POST** `/auth/login`

Autentica un usuario existente.

**Request Body:**
```json
{
  "email": "usuario@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "name": "Nombre Usuario",
    "role": "USER"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores:**
- `401 Unauthorized`: Credenciales incorrectas

---

### Refresh Token

**POST** `/auth/refresh`

Obtiene un nuevo access token usando el refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores:**
- `401 Unauthorized`: Refresh token inválido o expirado

---

## 👥 Usuarios

### Listar Usuarios

**GET** `/users`

🔒 Requiere autenticación

Obtiene la lista de todos los usuarios.

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "email": "admin@wigac.com",
    "name": "Admin User",
    "role": "ADMIN",
    "createdAt": "2024-01-15T10:00:00Z"
  },
  {
    "id": 2,
    "email": "user@wigac.com",
    "name": "Demo User",
    "role": "USER",
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

---

### Obtener Usuario

**GET** `/users/:id`

🔒 Requiere autenticación

Obtiene los detalles de un usuario específico.

**Response:** `200 OK`
```json
{
  "id": 1,
  "email": "admin@wigac.com",
  "name": "Admin User",
  "role": "ADMIN",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

**Errores:**
- `404 Not Found`: Usuario no existe

---

## 📁 Proyectos

### Listar Proyectos

**GET** `/projects`

🔒 Requiere autenticación

Obtiene todos los proyectos. Filtra por usuario si no es admin.

**Query Parameters:**
- `userId` (opcional): Filtrar por usuario

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Proyecto Alpha",
    "description": "Descripción del proyecto",
    "status": "ACTIVE",
    "color": "#007aff",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-12-31T00:00:00Z",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
]
```

---

### Obtener Proyecto

**GET** `/projects/:id`

🔒 Requiere autenticación

Obtiene un proyecto con sus tareas y páginas wiki.

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Proyecto Alpha",
  "description": "Descripción del proyecto",
  "status": "ACTIVE",
  "color": "#007aff",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-12-31T00:00:00Z",
  "tasks": [
    {
      "id": 1,
      "title": "Tarea 1",
      "status": "IN_PROGRESS"
    }
  ],
  "wikiPages": [
    {
      "id": 1,
      "title": "Documentación",
      "slug": "documentacion"
    }
  ]
}
```

**Errores:**
- `404 Not Found`: Proyecto no existe

---

### Crear Proyecto

**POST** `/projects`

🔒 Requiere autenticación

Crea un nuevo proyecto.

**Request Body:**
```json
{
  "name": "Nuevo Proyecto",
  "description": "Descripción del proyecto",
  "status": "ACTIVE",
  "color": "#34c759",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-12-31T00:00:00Z"
}
```

**Response:** `201 Created`
```json
{
  "id": 2,
  "name": "Nuevo Proyecto",
  "description": "Descripción del proyecto",
  "status": "ACTIVE",
  "color": "#34c759",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-12-31T00:00:00Z",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

**Errores:**
- `400 Bad Request`: Datos inválidos

---

### Actualizar Proyecto

**PUT** `/projects/:id`

🔒 Requiere autenticación

Actualiza un proyecto existente.

**Request Body:**
```json
{
  "name": "Proyecto Actualizado",
  "status": "COMPLETED"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Proyecto Actualizado",
  "status": "COMPLETED",
  ...
}
```

**Errores:**
- `404 Not Found`: Proyecto no existe

---

### Eliminar Proyecto

**DELETE** `/projects/:id`

🔒 Requiere autenticación

Elimina un proyecto y todas sus tareas/wiki asociadas.

**Response:** `200 OK`
```json
{
  "message": "Project deleted successfully"
}
```

**Errores:**
- `404 Not Found`: Proyecto no existe

---

## ✅ Tareas

### Listar Tareas

**GET** `/tasks`

🔒 Requiere autenticación

Obtiene todas las tareas con filtros opcionales.

**Query Parameters:**
- `projectId` (opcional): Filtrar por proyecto
- `status` (opcional): TODO, IN_PROGRESS, COMPLETED
- `priority` (opcional): LOW, MEDIUM, HIGH
- `assignedUserId` (opcional): Filtrar por usuario asignado

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": "Implementar login",
    "description": "Crear página de login con validación",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "department": "Desarrollo",
    "startDate": "2024-01-15T00:00:00Z",
    "dueDate": "2024-01-20T00:00:00Z",
    "projectId": 1,
    "assignedUserId": 2,
    "project": {
      "id": 1,
      "name": "Proyecto Alpha"
    },
    "assignedUser": {
      "id": 2,
      "name": "Demo User"
    }
  }
]
```

---

### Obtener Tarea

**GET** `/tasks/:id`

🔒 Requiere autenticación

Obtiene una tarea con proyecto y usuario asignado.

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "Implementar login",
  "description": "Crear página de login con validación",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "department": "Desarrollo",
  "startDate": "2024-01-15T00:00:00Z",
  "dueDate": "2024-01-20T00:00:00Z",
  "projectId": 1,
  "assignedUserId": 2,
  "project": {
    "id": 1,
    "name": "Proyecto Alpha",
    "color": "#007aff"
  },
  "assignedUser": {
    "id": 2,
    "name": "Demo User",
    "email": "user@wigac.com"
  },
  "activities": []
}
```

---

### Crear Tarea

**POST** `/tasks`

🔒 Requiere autenticación

Crea una nueva tarea.

**Request Body:**
```json
{
  "title": "Nueva tarea",
  "description": "Descripción de la tarea",
  "status": "TODO",
  "priority": "MEDIUM",
  "department": "Desarrollo",
  "startDate": "2024-01-15T00:00:00Z",
  "dueDate": "2024-01-20T00:00:00Z",
  "projectId": 1,
  "assignedUserId": 2
}
```

**Response:** `201 Created`

---

### Actualizar Tarea

**PUT** `/tasks/:id`

🔒 Requiere autenticación

Actualiza una tarea existente.

**Request Body:**
```json
{
  "status": "COMPLETED",
  "priority": "LOW"
}
```

**Response:** `200 OK`

---

### Eliminar Tarea

**DELETE** `/tasks/:id`

🔒 Requiere autenticación

Elimina una tarea.

**Response:** `200 OK`

---

## ⏱️ Actividades (Time Tracking)

### Listar Actividades

**GET** `/activities`

🔒 Requiere autenticación

Obtiene actividades del usuario autenticado.

**Query Parameters:**
- `date` (opcional): YYYY-MM-DD - Fecha específica
- `startDate` (opcional): YYYY-MM-DD - Rango inicio
- `endDate` (opcional): YYYY-MM-DD - Rango fin

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "date": "2024-01-15T00:00:00Z",
    "hours": 3.5,
    "description": "Desarrollo de feature login",
    "taskId": 1,
    "userId": 2,
    "task": {
      "id": 1,
      "title": "Implementar login",
      "project": {
        "id": 1,
        "name": "Proyecto Alpha"
      }
    }
  }
]
```

---

### Crear Actividad

**POST** `/activities`

🔒 Requiere autenticación

Registra una nueva actividad de tiempo.

**Request Body:**
```json
{
  "date": "2024-01-15T00:00:00Z",
  "hours": 4,
  "description": "Implementación de API REST",
  "taskId": 1
}
```

**Response:** `201 Created`

---

### Eliminar Actividad

**DELETE** `/activities/:id`

🔒 Requiere autenticación

Elimina un registro de actividad.

**Response:** `200 OK`

---

## 📚 Wiki

### Listar Páginas Wiki

**GET** `/wiki`

🔒 Requiere autenticación

Obtiene páginas wiki, opcionalmente filtradas por proyecto.

**Query Parameters:**
- `projectId` (opcional): Filtrar por proyecto

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": "Guía de Instalación",
    "slug": "guia-instalacion",
    "content": "# Instalación\n\n...",
    "projectId": 1,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z",
    "project": {
      "id": 1,
      "name": "Proyecto Alpha"
    }
  }
]
```

---

### Obtener Página Wiki

**GET** `/wiki/:id`

🔒 Requiere autenticación

Obtiene una página wiki específica.

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "Guía de Instalación",
  "slug": "guia-instalacion",
  "content": "# Instalación\n\nPasos para instalar...",
  "projectId": 1,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z",
  "project": {
    "id": 1,
    "name": "Proyecto Alpha"
  }
}
```

---

### Crear Página Wiki

**POST** `/wiki`

🔒 Requiere autenticación

Crea una nueva página wiki en formato Markdown.

**Request Body:**
```json
{
  "title": "Nueva Página",
  "content": "# Título\n\nContenido en **Markdown**",
  "projectId": 1
}
```

**Response:** `201 Created`

---

### Actualizar Página Wiki

**PUT** `/wiki/:id`

🔒 Requiere autenticación

Actualiza una página wiki existente.

**Request Body:**
```json
{
  "title": "Título Actualizado",
  "content": "# Nuevo contenido\n\n..."
}
```

**Response:** `200 OK`

---

### Eliminar Página Wiki

**DELETE** `/wiki/:id`

🔒 Requiere autenticación

Elimina una página wiki.

**Response:** `200 OK`

---

## 📊 Reportes

### Generar Parte Diario (PDF)

**GET** `/reports/daily`

🔒 Requiere autenticación

Genera y descarga un PDF con el parte de trabajo del día.

**Query Parameters:**
- `date` (opcional): YYYY-MM-DD - Por defecto: hoy
- `userId` (opcional): ID del usuario - Por defecto: usuario autenticado

**Response:** `200 OK`
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="parte-trabajo-2024-01-15.pdf"

[Binary PDF data]
```

**Contenido del PDF:**
- Nombre del usuario
- Fecha del parte
- Lista de actividades con:
  - Tarea
  - Proyecto
  - Horas trabajadas
  - Descripción
- Total de horas del día

---

### Enviar Parte Diario por Email

**POST** `/reports/daily/send`

🔒 Requiere autenticación

Genera el parte de trabajo y lo envía por email.

**Query Parameters:**
- `date` (opcional): YYYY-MM-DD - Por defecto: hoy
- `email` (opcional): Destinatario - Por defecto: email del usuario autenticado
- `userId` (opcional): ID del usuario - Por defecto: usuario autenticado

**Response:** `200 OK`
```json
{
  "message": "Daily report sent successfully",
  "email": "usuario@example.com"
}
```

**Errores:**
- `500 Internal Server Error`: Error al enviar email

---

## 🚨 Códigos de Error

### 400 Bad Request
Datos de entrada inválidos o faltantes.

### 401 Unauthorized
Token JWT inválido, expirado o faltante.

### 403 Forbidden
El usuario no tiene permisos para realizar la acción.

### 404 Not Found
El recurso solicitado no existe.

### 422 Unprocessable Entity
Validación de datos fallida.

### 500 Internal Server Error
Error interno del servidor.

---

## 📝 Notas Adicionales

### Formatos de Fecha
- Todas las fechas están en formato ISO 8601: `YYYY-MM-DDTHH:mm:ss.sssZ`
- Zonas horarias en UTC

### Paginación
Actualmente no implementada. Se retornan todos los registros.

### Rate Limiting
No implementado en desarrollo. Recomendado para producción.

### CORS
Habilitado para `http://localhost:3000` en desarrollo.

---

**Última actualización**: 2024-01-15
