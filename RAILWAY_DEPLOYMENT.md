# Deployment en Railway

Este proyecto está configurado para ser desplegado en Railway.app.

## Requisitos Previos

1. Cuenta en [Railway.app](https://railway.app)
2. Git instalado
3. Node.js 18+ instalado localmente

## Pasos de Deployment

### 1. Instalar Railway CLI

```bash
npm install -g @railway/cli
```

### 2. Login en Railway

```bash
railway login
```

Se abrirá una ventana del navegador para autenticar.

### 3. Crear un Nuevo Proyecto

```bash
cd krriyos
railway init
```

Sigue los pasos del asistente para crear un nuevo proyecto.

### 4. Conectar tu Repositorio

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <tu-github-url>
git push -u origin main
```

### 5. Configurar Variables de Entorno

Usa el dashboard de Railway o:

```bash
railway variables
```

Variables necesarias:
- `DATABASE_URL`: Conexión a PostgreSQL (se genera automáticamente)
- `JWT_SECRET`: Contraseña JWT secreta (genera una aleatoria)
- `VITE_SUPABASE_URL`: URL de Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Llave de servicio de Supabase
- `NODE_ENV`: `production`

### 6. Conectar PostgreSQL

En el dashboard de Railway:
1. Click en "+ Add Service"
2. Selecciona "PostgreSQL"
3. La variable `DATABASE_URL` se configurará automáticamente

### 7. Deploy

Railway desplegará automáticamente cuando hagas push a `main`:

```bash
git push origin main
```

O manualmente:

```bash
railway deploy
```

### 8. Verificar el Deploy

```bash
railway logs
```

Ver la URL del aplicativo:

```bash
railway status
```

## Variables de Entorno Necesarias

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT
JWT_SECRET=tu-clave-secreta-aqui-cambiar-en-produccion

# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# Environment
NODE_ENV=production
PORT=3000
```

## Estructura del Proyecto

```
krriyos/
├── api/              # Funciones serverless (Node.js)
├── src/              # Frontend Vue 3
├── prisma/           # Configuración ORM
├── package.json      # Dependencias
├── vite.config.ts    # Configuración Vite
└── server.js         # Servidor Node.js para Railway
```

## Scripts Disponibles

```bash
# Desarrollo local
npm run dev:full

# Build para producción
npm run build

# Ejecutar servidor
node server.js

# Migraciones de base de datos
npm run prisma migrate deploy
```

## Troubleshooting

### Logs

Ver logs en tiempo real:
```bash
railway logs --follow
```

### Reconectar a un Proyecto Existente

```bash
railway link
```

### Redeploy

```bash
railway deploy --force
```

## Documentación Adicional

- [Railway Documentation](https://docs.railway.app)
- [Node.js on Railway](https://docs.railway.app/guides/nodejs)
- [PostgreSQL on Railway](https://docs.railway.app/databases/postgresql)
