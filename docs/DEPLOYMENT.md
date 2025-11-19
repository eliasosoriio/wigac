# Guía de Despliegue - Wigac

## 🚀 Opciones de Despliegue

Esta guía cubre tres escenarios de despliegue:

1. **Desarrollo Local** - Para desarrollo y testing
2. **Docker Compose (Producción)** - Despliegue simple en servidor único
3. **Kubernetes** - Despliegue escalable en producción

---

## 💻 Despliegue en Desarrollo Local

### Prerrequisitos

- Node.js 18+
- PostgreSQL 15+
- npm o yarn

### Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Seed de datos iniciales
npx prisma db seed

# Iniciar en modo desarrollo
npm run start:dev
```

El backend estará disponible en `http://localhost:3001`

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env:
# VITE_API_URL=http://localhost:3001/api

# Iniciar en modo desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

---

## 🐳 Despliegue con Docker Compose

### Prerrequisitos

- Docker 20.10+
- Docker Compose 2.0+

### Configuración

1. **Variables de Entorno**

Crear archivo `.env` en la raíz del proyecto:

```env
# Database
DATABASE_URL=postgresql://wigac:wigac_password@postgres:5432/wigac
POSTGRES_USER=wigac
POSTGRES_PASSWORD=wigac_password
POSTGRES_DB=wigac

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_cambiar_en_produccion
JWT_REFRESH_SECRET=tu_refresh_secret_muy_seguro_cambiar_en_produccion

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password
EMAIL_FROM=noreply@wigac.com

# Frontend
VITE_API_URL=http://localhost:3001/api
```

2. **Iniciar servicios**

```bash
# Build y start
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Ver estado
docker-compose ps
```

3. **Acceder a la aplicación**

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- PostgreSQL: localhost:5432

4. **Comandos útiles**

```bash
# Parar servicios
docker-compose down

# Parar y eliminar volúmenes (⚠️ elimina la BD)
docker-compose down -v

# Rebuild solo un servicio
docker-compose up -d --build backend

# Ver logs de un servicio
docker-compose logs -f backend

# Ejecutar comando en contenedor
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma db seed
```

---

## 🌐 Despliegue en Producción (VPS/Cloud)

### Preparación del Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt install docker-compose-plugin

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
```

### Configuración de Seguridad

1. **Variables de Entorno Seguras**

```env
# Generar secretos seguros
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -hex 16)
```

2. **Firewall**

```bash
# Configurar UFW
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

3. **SSL/TLS con Let's Encrypt**

Agregar servicio Nginx con Certbot en `docker-compose.yml`:

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    depends_on:
      - frontend
      - backend

  certbot:
    image: certbot/certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
```

Configuración Nginx (`nginx/nginx.conf`):

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name tu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;

    location / {
        proxy_pass http://frontend:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. **Obtener certificado SSL**

```bash
# Primera vez
docker-compose run --rm certbot certonly --webroot \
  --webroot-path /var/www/certbot \
  -d tu-dominio.com \
  -d www.tu-dominio.com
```

### Backup y Restauración

1. **Backup de Base de Datos**

```bash
# Crear backup
docker-compose exec postgres pg_dump -U wigac wigac > backup_$(date +%Y%m%d).sql

# Backup automático (crontab)
0 2 * * * cd /ruta/a/wigac && docker-compose exec postgres pg_dump -U wigac wigac > backups/backup_$(date +\%Y\%m\%d).sql
```

2. **Restaurar Backup**

```bash
# Restaurar desde archivo
cat backup_20240115.sql | docker-compose exec -T postgres psql -U wigac wigac
```

### Monitoreo

1. **Logs**

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Logs de últimas 100 líneas
docker-compose logs --tail=100

# Logs de un servicio específico
docker-compose logs -f backend
```

2. **Health Checks**

Agregar en `docker-compose.yml`:

```yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  postgres:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U wigac"]
      interval: 10s
      timeout: 5s
      retries: 5
```

3. **Recursos**

```bash
# Ver uso de recursos
docker stats

# Ver solo servicios de wigac
docker stats $(docker-compose ps -q)
```

---

## ☸️ Despliegue en Kubernetes

### Archivos de Configuración

1. **Namespace**

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: wigac
```

2. **ConfigMap**

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: wigac-config
  namespace: wigac
data:
  DATABASE_URL: "postgresql://wigac:password@postgres:5432/wigac"
  EMAIL_HOST: "smtp.gmail.com"
  EMAIL_PORT: "587"
```

3. **Secrets**

```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: wigac-secrets
  namespace: wigac
type: Opaque
stringData:
  JWT_SECRET: "tu-jwt-secret"
  JWT_REFRESH_SECRET: "tu-refresh-secret"
  EMAIL_USER: "tu-email@gmail.com"
  EMAIL_PASS: "tu-app-password"
  POSTGRES_PASSWORD: "tu-postgres-password"
```

4. **PostgreSQL**

```yaml
# k8s/postgres.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: wigac
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: wigac
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        env:
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: wigac-secrets
              key: POSTGRES_PASSWORD
        - name: POSTGRES_USER
          value: "wigac"
        - name: POSTGRES_DB
          value: "wigac"
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: wigac
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
```

5. **Backend**

```yaml
# k8s/backend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: wigac
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: tu-registry/wigac-backend:latest
        envFrom:
        - configMapRef:
            name: wigac-config
        - secretRef:
            name: wigac-secrets
        ports:
        - containerPort: 3001
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: wigac
spec:
  selector:
    app: backend
  ports:
  - port: 3001
    targetPort: 3001
```

6. **Frontend**

```yaml
# k8s/frontend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: wigac
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: tu-registry/wigac-frontend:latest
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: wigac
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
```

7. **Ingress**

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: wigac-ingress
  namespace: wigac
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - tu-dominio.com
    secretName: wigac-tls
  rules:
  - host: tu-dominio.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend
            port:
              number: 3001
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
```

### Desplegar en Kubernetes

```bash
# Aplicar configuraciones
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress.yaml

# Ver estado
kubectl get all -n wigac

# Ver logs
kubectl logs -f deployment/backend -n wigac
```

---

## 📊 Métricas y Monitoreo

### Prometheus + Grafana

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    volumes:
      - grafana-data:/var/lib/grafana
    ports:
      - "3030:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin

volumes:
  prometheus-data:
  grafana-data:
```

---

## ✅ Checklist de Producción

- [ ] Cambiar todos los secretos y passwords
- [ ] Configurar SSL/TLS
- [ ] Habilitar backups automáticos
- [ ] Configurar monitoreo y alertas
- [ ] Configurar rate limiting
- [ ] Revisar logs de errores
- [ ] Configurar CORS correctamente
- [ ] Habilitar compresión Gzip
- [ ] Optimizar imágenes Docker
- [ ] Documentar proceso de despliegue
- [ ] Configurar CI/CD
- [ ] Plan de rollback

---

**Última actualización**: 2024-01-15
