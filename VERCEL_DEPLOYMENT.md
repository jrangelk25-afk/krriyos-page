# Deployment en Vercel

Este proyecto ha sido configurado para desplegarse en Vercel en lugar de Netlify.

## Cambios realizados

✅ **Eliminado:** `netlify.toml`
✅ **Creado:** `vercel.json` - Configuración para Vercel
✅ **Creada:** Carpeta `/api` - Para Vercel Functions
✅ **Actualizado:** `.gitignore` - Añadidas exclusiones de Vercel
✅ **Instalado:** `@vercel/node` - Para tipado de TypeScript en Functions

## Cómo desplegar en Vercel

### Opción 1: Desde CLI (Rápido)

```bash
# Instalar CLI de Vercel
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Opción 2: Desde GitHub (Recomendado - Deployments automáticos)

1. **Push tu código a GitHub**
   ```bash
   git add .
   git commit -m "Migrate from Netlify to Vercel"
   git push
   ```

2. **Ir a https://vercel.com**

3. **Crear nuevo proyecto:**
   - Click en "New Project"
   - Selecciona tu repositorio de GitHub
   - Vercel detectará automáticamente que es un proyecto Vite + Vue
   - Click en "Deploy"

4. **Listo:** Tu sitio estará en vivo en `https://tu-proyecto.vercel.app`

## Estructura del proyecto

```
proyecto/
├── api/                          # Vercel Functions (Serverless)
│   ├── hello.ts                  # Ejemplo de function
│   └── ...                       # Agregar más functions aquí
├── src/
│   ├── components/
│   ├── views/
│   ├── stores/
│   └── ...
├── dist/                         # Build output (se genera automáticamente)
├── vercel.json                   # Configuración de Vercel
└── package.json
```

## Vercel Functions

Las funciones serverless se crean en la carpeta `/api`:

```typescript
// api/products.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Tu código aquí
  res.status(200).json({ message: 'Hello from Vercel!' })
}
```

**URL de acceso:** `https://tu-dominio.com/api/products`

## Variables de Entorno

Para añadir variables de entorno en Vercel:

1. Ir a tu proyecto en vercel.com
2. Settings → Environment Variables
3. Agregar variables (ej: `VITE_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, etc)
4. Los cambios se aplican automáticamente en el próximo deploy

## Performance

Vercel proporciona:
- ✅ CDN global automático
- ✅ Edge Functions en +260 ciudades
- ✅ Compresión automática (Gzip/Brotli)
- ✅ Optimización de imágenes
- ✅ HTTP/2 Push
- ✅ Zero-downtime deployments

## Ventajas sobre Netlify

- 🚀 Edge Functions gratis (vs $10/mes en Netlify)
- ⚡ Cold start más rápido (~200ms vs 1-2s)
- 📊 Analytics integrado
- 🔄 Preview Deployments mejorados
- 🎯 Mejor soporte para Vue/Vite

## Monitoreo

Vercel Dashboard proporciona:
- Logs en tiempo real
- Analytics de performance
- Core Web Vitals
- Error tracking
- Deployments history

## Soporte

- Documentación: https://vercel.com/docs
- Dashboard: https://vercel.com/dashboard
- CLI Docs: https://vercel.com/cli/docs
