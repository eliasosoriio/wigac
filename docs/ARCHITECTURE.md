# Arquitectura del Sistema Wigac

## 📐 Vista General

Wigac es una aplicación web de gestión de proyectos que sigue una arquitectura cliente-servidor de tres capas:

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENTE (Browser)                       │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         React + TypeScript + TailwindCSS            │    │
│  │                                                      │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐     │    │
│  │  │  Pages   │  │Components│  │  State Mgmt  │     │    │
│  │  │          │  │   (UI)   │  │   (Zustand)  │     │    │
│  │  └──────────┘  └──────────┘  └──────────────┘     │    │
│  │                                                      │    │
│  │              ┌──────────────────┐                   │    │
│  │              │   API Client     │                   │    │
│  │              │    (Axios)       │                   │    │
│  │              └────────┬─────────┘                   │    │
│  └──────────────────────┼──────────────────────────────┘    │
└─────────────────────────┼───────────────────────────────────┘
                          │ HTTP/REST
                          │ JSON
┌─────────────────────────┼───────────────────────────────────┐
│                         ▼                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │              NGINX (Reverse Proxy)                  │    │
│  │         /     → Frontend    /api → Backend          │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│                      SERVIDOR                                │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              NestJS Backend API                     │    │
│  │                                                      │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐     │    │
│  │  │   Auth   │  │  Business│  │   Services   │     │    │
│  │  │  Module  │  │  Modules │  │  (PDF/Email) │     │    │
│  │  └──────────┘  └──────────┘  └──────────────┘     │    │
│  │                                                      │    │
│  │              ┌──────────────────┐                   │    │
│  │              │  Prisma ORM      │                   │    │
│  │              └────────┬─────────┘                   │    │
│  └──────────────────────┼──────────────────────────────┘    │
└─────────────────────────┼───────────────────────────────────┘
                          │ SQL
┌─────────────────────────┼───────────────────────────────────┐
│                         ▼                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │             PostgreSQL Database                     │    │
│  │                                                      │    │
│  │   Users │ Projects │ Tasks │ Activities │ Wiki     │    │
│  │                                                      │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│                   CAPA DE DATOS                              │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Datos

### 1. Autenticación

```
Usuario → Login Form → POST /api/auth/login
                            ↓
                    Validar credenciales
                            ↓
                    Generar JWT token
                            ↓
                    Retornar { user, token }
                            ↓
              Guardar en localStorage (Zustand)
                            ↓
            Incluir en headers de requests futuros
```

### 2. CRUD Operaciones (Ejemplo: Proyectos)

```
Usuario → Acción UI → API Request (con JWT)
                            ↓
                  Validar JWT (Guard)
                            ↓
              Extraer user de token (Strategy)
                            ↓
            Ejecutar Controller → Service
                            ↓
              Prisma ORM → PostgreSQL
                            ↓
            Retornar datos → Frontend
                            ↓
          Actualizar UI (React State)
```

### 3. Generación de Reportes

```
Usuario → Click "Generar Parte"
              ↓
    GET /api/reports/daily?date=2024-01-15
              ↓
    Backend: Obtener actividades del día
              ↓
    PdfService: Generar HTML → PDF (Puppeteer)
              ↓
    Retornar Buffer PDF
              ↓
    Browser: Descargar archivo

[OPCIONAL: Envío por Email]
              ↓
    POST /api/reports/daily/send
              ↓
    EmailService: Nodemailer → SMTP
              ↓
    Email enviado con PDF adjunto
```

## 🏛️ Patrones de Arquitectura

### Frontend

#### 1. **Component-Based Architecture**
- Componentes reutilizables en `/components/ui/`
- Composición sobre herencia
- Props bien tipadas con TypeScript

#### 2. **State Management Pattern**
- **Global State**: Zustand para auth
- **Server State**: TanStack Query para data fetching
- **Local State**: useState/useReducer

#### 3. **Routing Pattern**
- React Router v6 con rutas protegidas
- Layout wrapper para páginas autenticadas
- Lazy loading de rutas

### Backend

#### 1. **Modular Architecture (NestJS)**
```
app.module
├── auth.module
├── users.module
├── projects.module
├── tasks.module
├── activities.module
├── wiki.module
└── reports.module
```

Cada módulo contiene:
- **Controller**: Maneja HTTP requests
- **Service**: Lógica de negocio
- **DTOs**: Validación de datos
- **Entities**: Tipos de datos

#### 2. **Repository Pattern**
- Prisma ORM como capa de abstracción
- Queries centralizadas en services
- Fácil testing y cambio de BD

#### 3. **Guard Pattern**
- JWT Auth Guard para rutas protegidas
- Role-based guards (Admin/User)
- Validación automática de tokens

#### 4. **Strategy Pattern**
- Local Strategy para login
- JWT Strategy para requests autenticados
- Passport.js integration

## 🔐 Seguridad

### Autenticación y Autorización

1. **Password Hashing**
   - Bcrypt con salt rounds = 10
   - Nunca almacenar passwords en texto plano

2. **JWT Tokens**
   - Access Token: 15 minutos
   - Refresh Token: 7 días
   - Firmados con secretos seguros

3. **Guards y Middleware**
   - Validación de JWT en cada request protegido
   - CORS habilitado solo para frontend
   - Rate limiting (recomendado para producción)

### Validación de Datos

1. **Frontend**
   - Validación en formularios
   - TypeScript types estrictos

2. **Backend**
   - Class-validator en DTOs
   - Transformación automática de datos
   - Whitelist: solo propiedades definidas

## 📊 Modelo de Datos

### Relaciones

```
User (1) ──┬──> (n) Project
           │
           ├──> (n) Task
           │
           └──> (n) Activity

Project (1) ─┬─> (n) Task
             │
             └─> (n) WikiPage

Task (1) ───> (n) Activity
```

### Constraints

- **CASCADE DELETE**: Al eliminar un proyecto, se eliminan tareas y wiki
- **SET NULL**: Al eliminar usuario, tareas quedan sin asignar
- **UNIQUE**: Emails de usuarios únicos

## 🚀 Despliegue

### Desarrollo Local

```
Docker Compose:
  - Frontend (dev server): localhost:3000
  - Backend (dev server): localhost:3001
  - PostgreSQL: localhost:5432
```

### Producción

```
Docker Compose:
  - Nginx (frontend build + proxy): port 80
  - NestJS (compiled): port 3001
  - PostgreSQL: internal network
```

### Variables de Entorno

**Frontend (.env)**
```
VITE_API_URL=http://localhost:3001/api
```

**Backend (.env)**
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
EMAIL_HOST=...
EMAIL_USER=...
EMAIL_PASS=...
```

## 📈 Escalabilidad

### Optimizaciones Futuras

1. **Caché**
   - Redis para sesiones y caché
   - Cache de queries frecuentes

2. **Load Balancing**
   - Múltiples instancias de backend
   - Nginx como load balancer

3. **CDN**
   - Assets estáticos en CDN
   - Imágenes optimizadas

4. **Database**
   - Read replicas
   - Connection pooling
   - Índices optimizados

## 🧪 Testing

### Frontend
- Unit tests: Vitest
- Component tests: React Testing Library
- E2E: Playwright (recomendado)

### Backend
- Unit tests: Jest
- Integration tests: Supertest
- E2E: Jest + Database seed

## 📝 Logging y Monitoring

- Winston para logging estructurado
- Sentry para error tracking
- PM2 para process management
- Prometheus + Grafana para métricas

---

**Última actualización**: 2024-01-15
