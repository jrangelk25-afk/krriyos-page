# 🚀 Railway Cost Optimization Plan

## Objetivo
Reducir costos de Railway en un **50-70%** ($120-250/mes) optimizando la arquitectura del backend y base de datos.

---

## 📊 Resumen de Impacto por Problema

| Problema | Impacto CPU | Impacto Memoria | Impacto BD | Costo Mensual |
|----------|-----------|-----------------|-----------|---------------|
| Connection pooling | 40% | 30% | 25% | $30-50 |
| Dashboard queries | 15% | 5% | 40% | $20-30 |
| N+1 queries GET | 10% | 10% | 20% | $15-25 |
| PUT products | 20% | 15% | 15% | $25-40 |
| Disconnect overhead | 8% | 5% | - | $10-15 |
| Bundle size | - | 15% | - | $10-15 |
| Missing indexes | 5% | - | 30% | $20-30 |
| No caching | 5% | - | 10% | $15-25 |

**TOTAL: 50-70% de ahorro potencial**

---

## 🎯 Fases de Implementación

### ⚡ Fase 1: Máximo Impacto (40-50% ahorro)
Cambios fundamentales que requieren minutos de trabajo

#### 1.1 Crear Connection Pool Centralizado
**Archivos a crear/modificar:**
- `lib/prisma.ts` (crear nuevo)
- `api/**/*.ts` (modificar todos los endpoints)

**Problema actual:**
```typescript
// En CADA endpoint:
const prisma = new PrismaClient()  // ❌ Nueva conexión
// ... lógica
await prisma.$disconnect()          // ❌ Desconecta
```

**Impacto del problema:**
- 5,000 requests/hora = 5,000 conexiones nuevas/hora
- Cada conexión: 10-50ms de latencia
- = 500-4000ms de overhead puro

**Solución:**
```typescript
// lib/prisma.ts (NUEVO ARCHIVO)
import { PrismaClient } from '@prisma/client'

let prismaInstance: PrismaClient | null = null

export function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient()
  }
  return prismaInstance
}

// Para graceful shutdown
export async function disconnectPrisma() {
  if (prismaInstance) {
    await prismaInstance.$disconnect()
  }
}
```

**Cambios en endpoints:**
```typescript
// Antes
const prisma = new PrismaClient()
// const result = await prisma.product.findMany()
// await prisma.$disconnect()

// Después
import { getPrisma } from '../lib/prisma'
const prisma = getPrisma()
// const result = await prisma.product.findMany()
// (sin $disconnect)
```

**Archivos a modificar (20 archivos):**
- `/api/public/*.ts` (4 archivos)
- `/api/admin/*.ts` (16 archivos)
- `/api/auth/*.ts` (1 archivo)

**Beneficios:**
- ✅ CPU: -40%
- ✅ Memoria: -30%
- ✅ Latencia: -50%
- ✅ Conexiones BD: 5,000/hora → 1/segundo = Pool size ~10

**Tiempo estimado:** 30-45 minutos

---

#### 1.2 Remover todos los `$disconnect()`
**Archivos a modificar:** Todos los endpoints (21 archivos)

**Líneas a eliminar:**
```typescript
finally {
  await prisma.$disconnect()  // ❌ ELIMINAR
}
```

**Por qué:**
- Con pool centralizado, la conexión se mantiene abierta
- `$disconnect()` solo se necesita al shutdown de la app
- Cada disconnect = 50-200ms de overhead

**Archivo a actualizar para shutdown:**
```typescript
// server.js
// Al final del archivo, agregar:
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...')
  await disconnectPrisma()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...')
  await disconnectPrisma()
  process.exit(0)
})
```

**Beneficios:**
- ✅ Latencia: -10-15%
- ✅ CPU: -8%

**Tiempo estimado:** 15 minutos

---

#### 1.3 Agregar Índices en PostgreSQL
**Archivo a crear:** `prisma/migrations/[timestamp]_add_performance_indexes/migration.sql`

**Queries sin índices actuales:**
```sql
-- Sin índices, hace FULL TABLE SCAN
WHERE categoryId = $1 AND isActive = true AND isOutlet = true
WHERE status = $1
WHERE email = $1
```

**Índices a agregar:**
```sql
-- Índices compuestos para queries más comunes
CREATE INDEX idx_products_category_active_outlet 
  ON products(category_id, is_active, is_outlet);

CREATE INDEX idx_products_sku 
  ON products(sku);

CREATE INDEX idx_orders_status_created 
  ON orders(status, created_at DESC);

CREATE INDEX idx_customers_email 
  ON customers(email);

CREATE INDEX idx_order_items_product 
  ON order_items(product_id);

CREATE INDEX idx_admin_users_email 
  ON admin_users(email);

CREATE INDEX idx_audit_logs_admin_created 
  ON audit_log(admin_user_id, created_at DESC);

CREATE INDEX idx_product_colors_product 
  ON product_colors(product_id);

CREATE INDEX idx_product_sizes_product 
  ON product_sizes(product_id);

CREATE INDEX idx_product_images_product 
  ON product_images(product_id);
```

**Impacto real:**
- Query time: 100ms (sin índice) → 5ms (con índice)
- = **20x más rápido**
- Por 5,000 queries/día: 500,000ms → 25,000ms = **475 segundos ahorrados/día**

**Beneficios:**
- ✅ Query time: -80-90%
- ✅ BD CPU: -50%
- ✅ Memory: -20%

**Tiempo estimado:** 10 minutos (escribir SQL) + migration automática

---

#### 1.4 Optimizar Dashboard Queries
**Archivo a modificar:** `api/admin/dashboard.ts`

**Problema actual:**
```typescript
// 6-7 QUERIES SEPARADAS:
const totalOrders = await prisma.order.count()              // Query 1
const totalCustomers = await prisma.customer.count()        // Query 2
const totalProducts = await prisma.product.count()          // Query 3
const orderStats = await prisma.order.aggregate(...)        // Query 4
const recentOrders = await prisma.order.findMany(...)       // Query 5
const lowStockProducts = await prisma.product.findMany(...) // Query 6
const ordersByMonth = await prisma.order.groupBy(...)       // Query 7
```

**Impacto:**
- Dashboard queries cada 5 min = 288/día
- 7 queries × 288 = 2,016 queries/día
- Cada query = 100-200ms
- = 202-403 segundos/día en BD

**Solución - Combinar en 2 queries:**

```typescript
// dashboard.ts - VERSIÓN OPTIMIZADA
export default async function handler(
  req: ApiRequest,
  res: ApiResponse
) {
  // ... auth validation ...
  
  try {
    // Query 1: Todos los stats en una sola query
    const stats = await prisma.$queryRaw`
      SELECT
        (SELECT COUNT(*) FROM orders) as "totalOrders",
        (SELECT COUNT(*) FROM customers) as "totalCustomers",
        (SELECT COUNT(*) FROM products) as "totalProducts",
        (SELECT COALESCE(SUM(total), 0) FROM orders) as "totalRevenue",
        (SELECT COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '6 months') 
         FROM orders) as "ordersLast6Months"
    ` as any

    // Query 2: Datos relacionados (recent + low stock + by month)
    const [recentOrders, lowStockProducts, ordersByMonth] = await Promise.all([
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: true, items: { include: { product: true } } },
      }),
      prisma.product.findMany({
        where: { stock: { lte: 5 } },
        take: 5,
        orderBy: { stock: 'asc' },
      }),
      prisma.order.groupBy({
        by: ['createdAt'],
        where: { createdAt: { gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) } },
        _sum: { total: true },
        _count: true,
      }),
    ])

    // Formatear respuesta
    return res.status(200).json({
      stats: {
        totalOrders: Number(stats[0].totalOrders),
        totalCustomers: Number(stats[0].totalCustomers),
        totalProducts: Number(stats[0].totalProducts),
        totalRevenue: stats[0].totalRevenue,
      },
      recentOrders,
      lowStockProducts,
      salesByMonth: ordersByMonth,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
```

**Alternativa con caching (aún mejor):**
```typescript
// Con memoization simple
let cachedDashboardData: any = null
let lastDashboardUpdate = 0
const DASHBOARD_CACHE_TTL = 5 * 60 * 1000 // 5 minutos

export default async function handler(req: ApiRequest, res: ApiResponse) {
  // ... auth ...
  
  const now = Date.now()
  if (cachedDashboardData && (now - lastDashboardUpdate) < DASHBOARD_CACHE_TTL) {
    return res.status(200).json(cachedDashboardData)
  }
  
  // Si no hay cache, hacer queries...
  const data = { /* ... */ }
  cachedDashboardData = data
  lastDashboardUpdate = now
  
  return res.status(200).json(data)
}
```

**Beneficios:**
- ✅ Queries: 7 → 2-3 (70% reducción)
- ✅ Tiempo dashboard: 700-1400ms → 100-200ms
- ✅ BD CPU: -40%

**Tiempo estimado:** 20-30 minutos

---

### **Fase 1: Resumen y Checklist**

```
FASE 1 - MÁXIMO IMPACTO (40-50% ahorro)
Tiempo total: ~100 minutos

□ 1.1 Crear lib/prisma.ts con pool centralizado
  - Crear archivo nuevo lib/prisma.ts
  - Actualizar 21 endpoints para usar getPrisma()
  - Remover new PrismaClient() de cada endpoint
  
□ 1.2 Remover $disconnect() de todos los endpoints
  - Eliminar finally { await prisma.$disconnect() } (21 archivos)
  - Agregar graceful shutdown en server.js
  
□ 1.3 Agregar índices en PostgreSQL
  - Crear migration con índices compuestos
  - Ejecutar migration en Supabase
  - Verificar con EXPLAIN ANALYZE
  
□ 1.4 Optimizar dashboard endpoint
  - Combinar queries con $queryRaw o Promise.all
  - Agregar caching opcional (5-10 min)
  - Probar que responde en <200ms

VERIFICACIÓN:
- npm run build (debe pasar sin errores)
- npm run test (si hay tests)
- Railway deploy automático
- Monitorear en Railway: CPU, Memoria, Conexiones BD
```

---

### 🔧 Fase 2: Optimizaciones Medias (15-25% ahorro adicional)
Cambios complejos que mejoran performance específica

#### 2.1 Refactorizar PUT /api/admin/products/:id
**Archivo a modificar:** `api/admin/products/[id].ts` (~300 líneas)

**Problema actual:**
- 15-25 queries en una sola request
- Loops dentro de loops creando transacciones implícitas
- Alto riesgo de deadlocks

**Solución - Usar Prisma transactions:**
```typescript
// Usar $transaction para paralelizar
const result = await prisma.$transaction([
  // Actualizar colores (batch)
  prisma.productColor.deleteMany({ where: { productId: id } }),
  prisma.productColor.createMany({ data: colorsToCreate }),
  
  // Actualizar tallas (batch)
  prisma.productSize.deleteMany({ where: { productId: id } }),
  prisma.productSize.createMany({ data: sizesToCreate }),
  
  // Actualizar imágenes
  prisma.productImage.deleteMany({ where: { productId: id } }),
  prisma.productImage.createMany({ data: imagesToCreate }),
  
  // Actualizar producto
  prisma.product.update({ where: { id }, data: updateData }),
])
```

**Beneficios:**
- ✅ Queries: 25 → 8-10 (60% reducción)
- ✅ Tiempo: 500-1000ms → 150-300ms
- ✅ CPU: -20%

**Tiempo estimado:** 45-60 minutos

---

#### 2.2 Agregar Static File Caching
**Archivo a modificar:** `server.js`

**Problema actual:**
```typescript
app.use(express.static('dist'))  // ❌ Sin cache headers
// Cada request descarga JS/CSS completo
```

**Solución:**
```typescript
// En server.js, reemplazar la línea de express.static:
app.use(express.static('dist', {
  maxAge: '1d',        // Cache por 1 día en browser
  etag: false,         // No verificar etag (ahorra CPU)
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=3600') // 1 hora para HTML
    }
  }
}))
```

**Beneficios:**
- ✅ Bandwidth: -40-50%
- ✅ CPU: -10%
- ✅ Requests: 5,000 → 2,000/hora

**Tiempo estimado:** 5 minutos

---

#### 2.3 Optimizar GET /api/public/products/:id
**Archivo a modificar:** `api/public/products/[id].ts`

**Problema actual:**
```typescript
// Nested includes generan N+1 queries
const product = await prisma.product.findUnique({
  include: {
    sizes: {
      include: {
        colors: {           // ❌ Esto genera queries adicionales
          include: {
            color: true
          }
        }
      }
    }
  }
})
```

**Solución:**
```typescript
// Usar batch query como en GET /api/public/products
const product = await prisma.product.findUnique({
  where: { id },
  include: {
    category: true,
    images: { orderBy: { displayOrder: 'asc' } },
    colors: { orderBy: { displayOrder: 'asc' } },
    sizes: { orderBy: { id: 'asc' } },
  }
})

// Luego batch fetch de size-colors mappings
const sizeColorMappings = await prisma.productSizeColor.findMany({
  where: { sizeId: { in: product.sizes.map(s => s.id) } },
  include: { color: true }
})

// Enriquecer en memoria
const enrichedProduct = {
  ...product,
  sizes: product.sizes.map(size => ({
    ...size,
    availableColors: sizeColorMappings
      .filter(m => m.sizeId === size.id)
      .map(m => m.color)
  }))
}
```

**Beneficios:**
- ✅ Queries: 50+ → 2-3 (95% reducción)
- ✅ Tiempo: 800-1500ms → 50-100ms
- ✅ CPU: -15%

**Tiempo estimado:** 30 minutos

---

### **Fase 2: Resumen y Checklist**

```
FASE 2 - OPTIMIZACIONES MEDIAS (15-25% ahorro adicional)
Tiempo total: ~100-120 minutos

□ 2.1 Refactorizar PUT products endpoint
  - Convertir loops a $transaction
  - Usar createMany/deleteMany en batch
  - Validar con tests
  
□ 2.2 Agregar static file caching
  - Modificar server.js
  - Probar Cache-Control headers
  
□ 2.3 Optimizar GET products/:id
  - Cambiar a batch queries
  - Enriquecer en memoria
  - Probar performance

VERIFICACIÓN:
- npm run build
- Probar endpoints en Postman
- Verificar tiempo de respuesta
- Railway deploy
```

---

### 💎 Fase 3: Refinamientos (5-10% ahorro adicional)
Mejoras opcionales para casos de alto tráfico

#### 3.1 Implementar Redis Caching (Opcional)
**Para:** Dashboard, categorías, productos populares

**Servicios a usar:**
- Railway Redis (add-on)
- O Upstash (free tier con 10GB)

**Implementación básica:**
```typescript
// lib/cache.ts
import redis from 'redis'

const client = redis.createClient({
  url: process.env.REDIS_URL
})

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  const cached = await client.get(key)
  if (cached) return JSON.parse(cached)
  
  const data = await fetcher()
  await client.setEx(key, ttl, JSON.stringify(data))
  return data
}
```

**Usar en endpoints:**
```typescript
// En dashboard.ts
const dashboardData = await getCached(
  'dashboard:stats',
  () => fetchDashboardStats(),
  300 // 5 minutos
)
```

**Beneficios:**
- ✅ Dashboard queries: 0 a Redis (ultra rápido)
- ✅ BD load: -80%
- ✅ Response time: <10ms

**Costo:** +$5-10/mes Redis

**Tiempo estimado:** 60-90 minutos

---

#### 3.2 Limpieza de Bundle
**Archivos a revisar:** `package.json`

**Dependencias no usadas en backend:**
```json
// Remover o mover a devDependencies:
"gsap": "^3.15.0",        // Solo frontend
"sharp": "^30MB"          // No se usa (podría usarse para image resizing)
"vitest", "jsdom"         // devDependencies
```

**Beneficios:**
- ✅ Bundle size: 150MB → 120MB
- ✅ Deploy time: -2 minutos
- ✅ Startup RAM: -30MB

**Tiempo estimado:** 10 minutos

---

#### 3.3 Implementar Monitoring
**Herramientas a usar:**
- Railway built-in metrics (CPU, Memory, Requests)
- Datadog o New Relic (free tier)

**Métricas a monitorear:**
```
- Response time (p50, p95, p99)
- Error rate
- DB query time
- Connection pool usage
- Memory usage
- CPU usage
```

**Dashboard a crear:**
```
POST /api/metrics (internamente)
- Registrar tiempo de respuesta
- Registrar queries ejecutadas
- Registrar errores
```

**Beneficios:**
- ✅ Visibilidad en optimizaciones
- ✅ Alertas ante degradación
- ✅ Decisiones basadas en datos

**Tiempo estimado:** 30-45 minutos

---

### **Fase 3: Resumen y Checklist**

```
FASE 3 - REFINAMIENTOS (5-10% ahorro adicional)
Tiempo total: ~150-200 minutos (opcional)

□ 3.1 Implementar Redis caching (OPCIONAL)
  - Agregar Redis add-on en Railway
  - Crear lib/cache.ts
  - Implementar en dashboard, categorías
  - Verificar hit rate
  
□ 3.2 Limpieza de bundle
  - Auditar package.json
  - Mover dependencias innecesarias
  - Verificar que build sigue funcionando
  
□ 3.3 Implementar monitoring
  - Configurar métricas
  - Crear dashboard
  - Establecer alertas

VERIFICACIÓN:
- Railway deploy
- Verificar métricas en tiempo real
- Comparar antes/después
```

---

## 📈 Resultados Esperados

### Fase 1 (40-50% ahorro)
**Antes:**
- CPU: 60-80% (con 200 usuarios concurrentes)
- Memoria: 600-800MB
- Response time: 300-500ms (promedio)
- Queries/segundo: 200-300

**Después:**
- CPU: 20-40%
- Memoria: 400-500MB
- Response time: 100-200ms
- Queries/segundo: 50-100

**Ahorro mensual:** $120-150

---

### Fase 2 (adicional 15-25%)
**Después:**
- CPU: 10-20%
- Memoria: 300-400MB
- Response time: 50-100ms
- Queries/segundo: 30-50

**Ahorro mensual:** +$40-75
**Total:** $160-225/mes

---

### Fase 3 (adicional 5-10%, opcional)
**Después:**
- CPU: 5-15%
- Memoria: 250-350MB
- Response time: 20-50ms
- Queries/segundo: 10-30

**Ahorro mensual:** +$20-50
**Total:** $180-275/mes

---

## 🚦 Plan de Ejecución Recomendado

### Semana 1: Fase 1 (Máximo impacto)
- Lunes: Crear pool centralizado + remover disconnects
- Martes: Agregar índices en BD
- Miércoles: Optimizar dashboard
- Jueves-Viernes: Testing en staging

### Semana 2: Fase 2 (Optimizaciones medias)
- Lunes: PUT products refactor
- Martes: Static file caching
- Miércoles: GET products/:id optimization
- Jueves-Viernes: Testing

### Semana 3: Fase 3 (Opcional)
- Si carga es alta y presupuesto lo permite
- Redis caching
- Monitoring
- Fine-tuning

---

## ✅ Checklist de Verificación

**Antes de cada deploy:**
- [ ] Build sin errores: `npm run build`
- [ ] Tests pasan: `npm run test`
- [ ] Sin warnings en console
- [ ] Railway health checks verdes
- [ ] Performance: Response time <200ms

**Después de cada deploy:**
- [ ] Monitorear CPU/Memory en Railway
- [ ] Verificar error rate en logs
- [ ] Comparar metrics con baseline
- [ ] Usuario reports en Slack/Discord

---

## 📞 Soporte

**Si algo falla:**
1. Revert automático del último commit
2. Revisar logs en Railway
3. Verificar BD en Supabase
4. Rollback a versión anterior si es necesario

**Contactos:**
- Railway Support: https://railway.app/support
- Prisma Docs: https://www.prisma.io/docs
- PostgreSQL Docs: https://www.postgresql.org/docs

---

## 🎉 Conclusión

Con esta estrategia de 3 fases:
- **Fase 1:** 40-50% ahorro en 2-3 días
- **Fase 2:** +15-25% ahorro en 2-3 días adicionales
- **Fase 3:** +5-10% ahorro (opcional)

**Ahorro total: 60-75% = $180-275/mes** 🚀

Inicio recomendado: **Inmediatamente con Fase 1**

