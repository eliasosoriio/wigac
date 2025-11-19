# Wigac - Sistema de Gestión de Proyectos

Aplicación web completa de gestión de proyectos con estética Apple-like, desarrollada con React + TypeScript + Vite + TailwindCSS en el frontend y NestJS + Prisma + PostgreSQL en el backend, completamente dockerizada.

![Wigac](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## ✨ Características Principales

### 📋 Gestión de Proyectos
- CRUD completo de proyectos
- Vista de lista con sidebar estilo Finder de macOS
- Estado del proyecto (activo, en espera, completado)
- Asignación de colores y fechas
- Visualización del progreso

### ✅ Gestión de Tareas
- CRUD de tareas asociadas a proyectos
- Campos: título, descripción, estado, prioridad, departamento, usuario asignado
- Vista de tabla con filtros
- Estados: Por hacer, En progreso, Completado
- Prioridades: Baja, Media, Alta

### 📊 Kanban Board
- Vista Kanban global con todas las tareas
- Drag & Drop entre columnas
- Columnas configurables
- Diseño minimalista Apple-style

### ⏱️ Time Tracking
- Registro de actividades diarias
- Asignación de horas por tarea
- Descripción de actividades
- Vista de calendario/timeline

### 📄 Generador de Partes de Trabajo
- Generación automática de PDF
- Resumen diario de actividades
- Total de horas trabajadas
- Envío automático por email

### 📚 Wiki Markdown
- Editor Markdown con vista previa
- CRUD de páginas wiki por proyecto
- Sintaxis GitHub Flavored Markdown
- Renderizado con highlight de código

## 🎨 Diseño Apple-Style

- **Glassmorphism** con transparencias y backdrop blur
- **Tipografía SF Pro** (San Francisco)
- **Paleta de colores Apple** (grises suaves, azul 007aff, etc.)
- **Componentes minimalistas** con bordes redondeados
- **Sombras sutiles** y animaciones suaves
- **Layout** tipo ventana de app macOS
- **Scrollbars** personalizados estilo macOS

## 🏗️ Arquitectura Técnica

### Frontend
```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # Componentes reutilizables
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Switch.tsx
│   │   │   ├── Table.tsx
│   │   │   └── ...
│   │   └── layout/          # Layout principal
│   │       ├── Layout.tsx
│   │       ├── Sidebar.tsx
│   │       └── Header.tsx
│   ├── pages/              # Páginas de la aplicación
│   │   ├── auth/
│   │   ├── projects/
│   │   ├── tasks/
│   │   ├── kanban/
│   │   ├── timetracking/
│   │   └── wiki/
│   ├── store/              # Estado global (Zustand)
│   ├── lib/                # Utilidades y API client
│   ├── types/              # TypeScript types
│   └── App.tsx
├── Dockerfile
└── nginx.conf
```

### Backend
```
backend/
├── src/
│   ├── auth/               # Autenticación JWT
│   │   ├── strategies/
│   │   ├── guards/
│   │   └── dto/
│   ├── users/              # Gestión de usuarios
│   ├── projects/           # Gestión de proyectos
│   ├── tasks/              # Gestión de tareas
│   ├── activities/         # Time tracking
│   ├── wiki/               # Wiki Markdown
│   ├── reports/            # PDF y emails
│   │   ├── pdf.service.ts
│   │   └── email.service.ts
│   ├── prisma/             # Prisma ORM
│   └── main.ts
├── prisma/
│   ├── schema.prisma       # Esquema de BD
│   └── seed.ts             # Datos iniciales
└── Dockerfile
```

## 🚀 Instalación y Uso

### Prerrequisitos

- Docker y Docker Compose
- Node.js 18+ (para desarrollo local)
- PostgreSQL (incluido en Docker)

### Instalación con Docker (Recomendado)

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/wigac.git
   cd wigac
   ```

2. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

3. **Iniciar con Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Acceder a la aplicación**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api
   - Base de datos: localhost:5432

### Instalación Local (Desarrollo)

#### Backend

```bash
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

#### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## 🔐 Credenciales por Defecto

Después del seed inicial:

- **Admin**
  - Email: admin@wigac.com
  - Password: admin123

- **Usuario**
  - Email: user@wigac.com
  - Password: user123

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/refresh` - Refresh token

### Proyectos
- `GET /api/projects` - Listar proyectos
- `GET /api/projects/:id` - Obtener proyecto
- `POST /api/projects` - Crear proyecto
- `PUT /api/projects/:id` - Actualizar proyecto
- `DELETE /api/projects/:id` - Eliminar proyecto

### Tareas
- `GET /api/tasks` - Listar tareas
- `GET /api/tasks/:id` - Obtener tarea
- `POST /api/tasks` - Crear tarea
- `PUT /api/tasks/:id` - Actualizar tarea
- `DELETE /api/tasks/:id` - Eliminar tarea

### Actividades (Time Tracking)
- `GET /api/activities?date=YYYY-MM-DD` - Listar actividades
- `POST /api/activities` - Registrar actividad
- `DELETE /api/activities/:id` - Eliminar actividad

### Wiki
- `GET /api/wiki?projectId=xxx` - Listar páginas
- `GET /api/wiki/:id` - Obtener página
- `POST /api/wiki` - Crear página
- `PUT /api/wiki/:id` - Actualizar página
- `DELETE /api/wiki/:id` - Eliminar página

### Reportes
- `GET /api/reports/daily?date=YYYY-MM-DD` - Descargar PDF
- `POST /api/reports/daily/send?date=YYYY-MM-DD&email=xxx` - Enviar por email

## 🗄️ Esquema de Base de Datos

### Modelos Principales

- **User**: Usuarios del sistema
  - id, email, password, name, role

- **Project**: Proyectos
  - id, name, description, status, color, dates

- **Task**: Tareas
  - id, title, description, status, priority, department, assignedUser

- **Activity**: Actividades diarias
  - id, date, hours, description, task, user

- **WikiPage**: Páginas de documentación
  - id, title, content (Markdown), project

## 🎨 Componentes UI Disponibles

Todos los componentes están diseñados con estética Apple:

- `<Button>` - Botones con variantes (primary, secondary, ghost, danger)
- `<Card>` - Tarjetas con glassmorphism opcional
- `<Input>` - Campos de texto con iconos
- `<Textarea>` - Área de texto
- `<Select>` - Selector dropdown
- `<Switch>` - Interruptor estilo iOS
- `<Tag>` - Etiquetas de colores
- `<Modal>` - Modales con backdrop blur
- `<Table>` - Tablas con hover effects

## 🔧 Configuración de Email

Para habilitar el envío de partes de trabajo por email, configura las variables en `.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password
EMAIL_FROM=noreply@wigac.com
```

Para Gmail, necesitas crear una [App Password](https://support.google.com/accounts/answer/185833).

## 📦 Scripts Disponibles

### Frontend
- `npm run dev` - Desarrollo
- `npm run build` - Build producción
- `npm run preview` - Preview del build

### Backend
- `npm run start:dev` - Desarrollo con watch
- `npm run build` - Build producción
- `npm run start:prod` - Producción
- `npm run prisma:migrate` - Ejecutar migraciones
- `npm run prisma:seed` - Seed de datos

## 🐳 Docker

### Servicios

- **postgres**: PostgreSQL 15
- **backend**: NestJS API
- **frontend**: React + Nginx

### Comandos útiles

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar servicios
docker-compose down

# Rebuild servicios
docker-compose up -d --build

# Ejecutar migraciones
docker-compose exec backend npx prisma migrate deploy

# Ejecutar seed
docker-compose exec backend npx prisma db seed
```

## 🛠️ Tecnologías Utilizadas

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- React Router v6
- Zustand (estado global)
- TanStack Query
- Axios
- React Markdown
- Framer Motion
- Lucide Icons
- date-fns

### Backend
- NestJS 10
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Passport
- Bcrypt
- Nodemailer
- Puppeteer (PDF)
- Class Validator

### DevOps
- Docker
- Docker Compose
- Nginx

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE) para más detalles.

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: Amazing Feature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Para preguntas o soporte:
- Abrir un issue en GitHub
- Email: support@wigac.com

---

Desarrollado con ❤️ usando tecnologías modernas y diseño Apple-inspired
