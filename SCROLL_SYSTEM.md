# 📜 Sistema de Scroll Robusto y Flexible

## 🎯 Visión General

Sistema completo de gestión de scroll para la navegación en Krriyos que proporciona:

- ✅ **Control granular por ruta** - Comportamiento personalizado según la página
- ✅ **Restauración de historial** - Mantiene posición al navegar con botón atrás
- ✅ **Soporte para anchors** - Scroll suave a elementos con hash
- ✅ **Animaciones configurables** - Smooth vs auto, delays personalizados
- ✅ **Manejo de offsets** - Para headers sticky y otras necesidades
- ✅ **Estado de scroll** - Previene múltiples scrolls simultáneos

---

## 🏗️ Arquitectura del Sistema

### Archivos Principales

```
src/
├── composables/
│   ├── useScrollBehavior.ts  # Lógica core del scroll
│   └── usePageScroll.ts       # Wrapper simplificado para componentes
├── components/
│   └── ScrollToTopButton.vue  # Botón flotante "al inicio"
└── main.ts                    # Integración con router
```

### Flujo de Funcionamiento

```
1. ANTES de navegar
   └─ router.beforeEach()
      └─ Guardar posición scroll de ruta actual

2. DURANTE la navegación
   └─ Vue renderiza nueva ruta

3. DESPUÉS de navegar
   └─ router.afterEach()
      ├─ Obtener configuración scroll de ruta
      ├─ Ejecutar scroll según config
      └─ Esperar a que elementos existan
```

---

## 🎓 Guía de Uso

### 1️⃣ Scroll al Top (Navegación)

En componentes con Vue, simplemente usar el router:

```vue
<template>
  <router-link to="/catalogo">Ir al Catálogo</router-link>
</template>

<!-- Automático: scroll al top cuando navegues -->
```

### 2️⃣ Scroll Suave a Sección

```vue
<template>
  <button @click="goToSection">Ver Detalles</button>
</template>

<script setup>
import { usePageScroll } from '@/composables/usePageScroll'

const scroll = usePageScroll()

const goToSection = () => {
  scroll.toElement('#details-section')
}
</script>
```

### 3️⃣ Scroll con Offset (Headers Sticky)

```vue
<script setup>
import { usePageScroll } from '@/composables/usePageScroll'

const scroll = usePageScroll()

// Offset de 80px para saltar el header
const goToProducts = () => {
  scroll.toElementWithOffset('#products', 80)
}
</script>
```

### 4️⃣ Scroll Programático

```vue
<script setup>
import { usePageScroll } from '@/composables/usePageScroll'

const scroll = usePageScroll()

// Scroll instantáneo
const toPosition = () => {
  scroll.toPosition(500) // 500px desde top
}

// Scroll suave al top
const backToTop = () => {
  scroll.toTop()
}
</script>
```

### 5️⃣ Usar el Botón Flotante

```vue
<template>
  <div id="app">
    <header>...</header>
    <main>...</main>
    <ScrollToTopButton /> <!-- Aparece cuando scrolleas >300px -->
  </div>
</template>

<script setup>
import ScrollToTopButton from '@/components/ScrollToTopButton.vue'
</script>
```

---

## ⚙️ Configuración Avanzada

### Personalizar Comportamiento por Ruta

En `src/main.ts`, dentro de `getRouteScrollBehavior()`:

```typescript
const customBehaviors: Record<string, ScrollConfig> = {
  '/catalogo': { behavior: 'auto', offset: 80 },      // Auto + offset
  '/producto/:id': { behavior: 'auto' },              // Auto sin offset
  '/checkout': { behavior: 'smooth', delay: 200 },    // Smooth con delay
  '/confirmacion': { behavior: 'auto', offset: 0 },   // Auto directo
}
```

### Configuración Global

```typescript
import { useScrollBehavior } from '@/composables/useScrollBehavior'

const scroll = useScrollBehavior()

// Cambiar comportamiento global
scroll.setScrollConfig({
  behavior: 'smooth',
  delay: 100,
  offset: 60,
  restoreHistory: true,
})
```

---

## 🎨 Animaciones de Scroll

### Smooth Scroll

```vue
<script setup>
import { usePageScroll } from '@/composables/usePageScroll'

const scroll = usePageScroll()

// Scroll suave
const smoothScroll = () => {
  scroll.toElement('#section', { behavior: 'smooth' })
}
</script>
```

### Scroll Instantáneo

```vue
<script setup>
import { useScrollBehavior } from '@/composables/useScrollBehavior'

const scroll = useScrollBehavior()

// Scroll sin animación
const instantScroll = () => {
  scroll.executeScroll(0, { behavior: 'auto' })
}
</script>
```

### Scroll con Delay

```vue
<script setup>
import { usePageScroll } from '@/composables/usePageScroll'

const scroll = usePageScroll()

// Esperar 300ms antes de scrollear (útil después de animaciones)
const delayedScroll = () => {
  scroll.toElement('#content', { delay: 300 })
}
</script>
```

---

## 📊 Estados y Control

### Prevenir múltiples scrolls

```vue
<template>
  <button @click="scroll.toTop" :disabled="scroll.isScrolling.value">
    {{ scroll.isScrolling.value ? 'Scrolleando...' : 'Al inicio' }}
  </button>
</template>

<script setup>
import { usePageScroll } from '@/composables/usePageScroll'

const scroll = usePageScroll()
</script>
```

### Ver historial de scroll

```typescript
import { useScrollBehavior } from '@/composables/useScrollBehavior'

const scroll = useScrollBehavior()

// Ver todas las posiciones guardadas
console.log(scroll.scrollHistory)

// Ver posición de una ruta específica
const homeScroll = scroll.getScrollPosition('/')
console.log(homeScroll) // { top: 150, left: 0 }
```

---

## 🔧 API Completa

### useScrollBehavior()

**Métodos:**

| Método | Descripción | Ejemplo |
|--------|-------------|---------|
| `saveScrollPosition(path)` | Guardar posición actual | `scroll.saveScrollPosition('/')` |
| `getScrollPosition(path)` | Obtener posición guardada | `scroll.getScrollPosition('/')` |
| `clearScrollPosition(path?)` | Limpiar historial | `scroll.clearScrollPosition()` |
| `executeScroll(target, options)` | Scroll a número/selector/elemento | `scroll.executeScroll(0)` |
| `scrollToTop(options)` | Scroll al inicio | `scroll.scrollToTop()` |
| `scrollToElement(selector, options)` | Scroll a elemento | `scroll.scrollToElement('#section')` |
| `setScrollConfig(config)` | Configurar globalmente | `scroll.setScrollConfig({...})` |

**Propiedades:**

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `isScrolling` | Ref<boolean> | Estado de scroll actual |
| `scrollHistory` | Map | Historial de posiciones |

---

### usePageScroll()

Wrapper simplificado para usar en componentes:

| Método | Descripción |
|--------|-------------|
| `toTop()` | Scroll suave al top |
| `toElement(selector, options?)` | Scroll a elemento |
| `toElementWithOffset(selector, offset?, options?)` | Scroll con offset |
| `toPosition(topPixels)` | Scroll instantáneo a posición |
| `clearHistory()` | Limpiar historial |

---

## 🐛 Troubleshooting

### El scroll no funciona en cierta ruta

**Problema:** Elemento no se renderiza a tiempo

**Solución:** Aumentar delay en configuración

```typescript
const customBehaviors: Record<string, ScrollConfig> = {
  '/producto/:id': { behavior: 'auto', delay: 300 }, // Aumentar a 300ms
}
```

### Scroll suave no funciona en Safari

**Problema:** Safari no soporta `behavior: 'smooth'` en algunos casos

**Solución:** Usar polyfill o fallback a `auto`

```typescript
const behavior = CSS.supports('scroll-behavior: smooth') ? 'smooth' : 'auto'
```

### Header se superpone en scroll

**Problema:** Header sticky cubre el contenido

**Solución:** Usar offset igual a altura del header

```typescript
scroll.toElementWithOffset('#section', 80) // Ajustar según altura header
```

---

## 📝 Mejores Prácticas

### ✅ DO's

```typescript
// ✅ Usar composables en lugar de scroll directo
const scroll = usePageScroll()
scroll.toTop()

// ✅ Usar offsets para headers sticky
scroll.toElementWithOffset('#section', 80)

// ✅ Guardar scroll position automáticamente
// (Ya lo hace el router)

// ✅ Usar smooth para transiciones visibles
scroll.toElement('#content', { behavior: 'smooth' })
```

### ❌ DON'Ts

```typescript
// ❌ No usar window.scrollTo directamente
window.scrollTo(0, 0) // Usa scroll.toTop() en su lugar

// ❌ No hacer scroll sin esperar a renderizado
scroll.executeScroll(0) // Sin await puede fallar

// ❌ No hacer múltiples scrolls simultáneos
// (El sistema lo previene con isScrolling)

// ❌ No usar selectores genéricos
scroll.toElement('div') // Usar IDs específicos: '#my-section'
```

---

## 🎯 Casos de Uso Comunes

### Caso 1: Botón "Volver al inicio"

```vue
<template>
  <button @click="backToTop" class="btn-top">↑ Al inicio</button>
</template>

<script setup>
import { usePageScroll } from '@/composables/usePageScroll'
const scroll = usePageScroll()
const backToTop = () => scroll.toTop()
</script>
```

### Caso 2: Navegación interna en página

```vue
<template>
  <nav>
    <button @click="goToSection('intro')">Intro</button>
    <button @click="goToSection('features')">Características</button>
    <button @click="goToSection('contact')">Contacto</button>
  </nav>
</template>

<script setup>
import { usePageScroll } from '@/composables/usePageScroll'
const scroll = usePageScroll()
const goToSection = (id) => scroll.toElement(`#${id}`)
</script>
```

### Caso 3: Sincronizar scroll con animación

```vue
<script setup>
import { usePageScroll } from '@/composables/usePageScroll'
import gsap from 'gsap'

const scroll = usePageScroll()

const smoothTransition = async () => {
  // Animar contenido
  await gsap.to('#content', { opacity: 1, duration: 0.5 }).then()
  // Luego scrollear
  await scroll.toElement('#content', { delay: 200 })
}
</script>
```

---

## 📊 Diagrama de Flujo

```
┌─────────────────────────────────────────┐
│         Usuario Navega                   │
└────────────────┬────────────────────────┘
                 │
        ┌────────▼────────┐
        │ router.beforeEach│
        │  Guardar posición │
        └────────┬────────┘
                 │
        ┌────────▼────────────┐
        │ Vue Renderiza Ruta   │
        └────────┬────────────┘
                 │
        ┌────────▼──────────────┐
        │ router.afterEach       │
        │ 1. Obtener config      │
        │ 2. Ejecutar scroll     │
        │ 3. Esperar elementos   │
        └────────┬──────────────┘
                 │
        ┌────────▼────────────┐
        │  ✅ Usuario ve      │
        │  página en posición   │
        │  correcta            │
        └──────────────────────┘
```

---

## 🚀 Próximos Pasos

Considera agregar:

- [ ] Scroll a elementos dinámicos (AJAX)
- [ ] Parallax scroll con GSAP
- [ ] Analytics de scroll (qué secciones leen usuarios)
- [ ] Scroll infinito para catálogo
- [ ] Scroll compartido entre tabs/ventanas

