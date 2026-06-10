# Guía de Despliegue en Netlify

## Prerequisitos

- Cuenta en [Netlify](https://www.netlify.com/)
- Repositorio GitHub, GitLab o Bitbucket con el proyecto
- Git instalado localmente

## Pasos para Desplegar

### 1. Preparar el Proyecto

```bash
# Verificar que todo compila correctamente
npm run build

# Verificar que la vista previa funciona
npm run preview
```

### 2. Conectar a Netlify

#### Opción A: Con Git (Recomendado - Despliegues Automáticos)

1. Sube tu proyecto a GitHub (o GitLab/Bitbucket)
2. Ve a [app.netlify.com](https://app.netlify.com/)
3. Haz clic en **"New site from Git"**
4. Selecciona tu proveedor de git (GitHub, GitLab, etc.)
5. Autoriza a Netlify
6. Selecciona tu repositorio
7. Confirma los siguientes ajustes:
   - **Branch to deploy**: `main` (o tu rama por defecto)
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
8. Haz clic en **"Deploy"**

#### Opción B: Deploy Manual (Sin Git)

1. Compila el proyecto localmente:
   ```bash
   npm run build
   ```

2. Ve a [app.netlify.com](https://app.netlify.com/) y arrastra la carpeta `dist/` al área de drop

### 3. Configuración Automática

El archivo `netlify.toml` en la raíz ya contiene:

- ✅ Comando de build: `npm run build`
- ✅ Carpeta de publicación: `dist`
- ✅ Redirecciones SPA (para Vue Router)
- ✅ Headers de seguridad y cache
- ✅ Optimizaciones de rendimiento

El archivo `public/_redirects` proporciona una alternativa de redirección SPA.

### 4. Variables de Entorno (Si Aplica)

Si tu aplicación necesita variables de entorno:

1. Ve a **Site settings** → **Build & deploy** → **Environment**
2. Haz clic en **Edit variables**
3. Agrega tus variables (ej: API_URL, etc.)
4. Redeploy el sitio

### 5. Verificar el Despliegue

Después del despliegue:

- ✅ Verifica que la URL del sitio funciona
- ✅ Prueba la navegación (Vue Router)
- ✅ Verifica que los assets se cargan correctamente
- ✅ Abre la consola del navegador (F12) para buscar errores

### 6. Despliegues Automáticos

Si usaste la opción Git:

- **Automático**: Cada push a `main` automáticamente redeploy
- **Preview**: Cada PR crea una vista previa (Deploy Preview)

### 7. Problema Común: "404 on Refresh"

Si al refrescar una ruta interna obtienes 404, es que las redirecciones SPA no funcionan.

**Solución**:
- Verifica que `netlify.toml` existe en la raíz
- O verifica que `public/_redirects` existe
- Redeploy el sitio

### 8. Optimizaciones Incluidas

- ✅ Split de código (vendor chunks)
- ✅ Minificación de assets
- ✅ Cache headers optimizado
- ✅ Security headers
- ✅ Compresión automática

## Troubleshooting

### Build Falla

```bash
# Verifica localmente
npm run build
npm run preview
```

### Assets no se cargan

- Verifica que el `vite.config.ts` tiene alias `@/` configurado
- Verifica que los paths son relativos (`/FOTOS/...` en lugar de `./FOTOS/...`)

### Styles no aplican

- Verifica que Tailwind CSS esté compilando correctamente
- Revisa `tailwind.config.js`

## URLs Útiles

- [Netlify Docs](https://docs.netlify.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#netlify)
- [Vue 3 SPA Deployment](https://router.vuejs.org/guide/advanced/lazy-loading-routes#with-webpack)

## Soporte

Para más ayuda, contacta el equipo de Netlify o revisa la documentación oficial.
