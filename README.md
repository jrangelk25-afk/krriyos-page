# krrillos | E-Commerce MVP

**Calzado Premium de Alto Rendimiento**

Una tienda en línea moderna construida con Vue 3, Vite y Tailwind CSS para la marca premium krrillos.

---

## 🚀 Quick Start

### Requisitos
- Node.js 18+
- npm 9+

### Instalación

```bash
# Clonar o descargar el proyecto
cd krrillos

# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev

# Acceder a http://localhost:5173
```

### Build para Producción

```bash
# Compilar proyecto
npm run build

# Verificar build en local
npm run preview
```

### Ejecutar Tests

```bash
# Tests de una sola pasada
npm test

# Tests en modo watch
npm run test:watch

# Tests con cobertura
npm run test:coverage
```

---

## 📁 Estructura de Carpetas

```
src/
├── components/          # Componentes reutilizables
│   ├── ProductCard.vue
│   ├── CartItem.vue
│   ├── CartDrawer.vue
│   ├── CheckoutForm.vue
│   ├── Header.vue
│   ├── Footer.vue
│   └── ...
├── views/              # Vistas principales (páginas)
│   ├── HomeView.vue
│   ├── CatalogView.vue
│   ├── ProductView.vue
│   ├── CheckoutView.vue
│   └── ConfirmationView.vue
├── stores/             # Estado global (Pinia)
│   ├── cartStore.ts
│   ├── productStore.ts
│   └── uiStore.ts
├── composables/        # Lógica reutilizable
│   ├── useCart.ts
│   ├── useProducts.ts
│   ├── useValidation.ts
│   └── useGSAP.ts
├── services/           # Integración con APIs y datos
│   ├── ProductService.ts
│   ├── EmailService.ts
│   └── StorageService.ts
├── data/              # Datos estáticos
│   └── products.ts
├── types/             # Tipos TypeScript
│   └── index.ts
├── router/            # Configuración de Vue Router
│   └── index.ts
├── assets/            # Imágenes, estilos, etc.
│   └── styles/
├── __tests__/         # Tests automatizados
│   ├── properties.pbt.test.ts    # Property-based tests
│   └── unit/
│       ├── ProductService.test.ts
│       ├── useValidation.test.ts
│       └── cartStore.test.ts
├── App.vue
├── main.ts
└── style.css
```

---

## 🎨 Componentes Principales

### ProductCard
Muestra un producto individual con imagen, nombre, precio y botón de agregar al carrito.

```typescript
// Uso
<ProductCard 
  :product="product"
  @addToCart="handleAddToCart"
/>
```

**Props:**
- `product: Product` - Objeto del producto

**Events:**
- `@addToCart` - Emite cuando el usuario agrega al carrito

### CartDrawer
Panel lateral que muestra los items del carrito con opciones para modificar cantidades.

```typescript
// Automático en Header
<CartDrawer />
```

### CheckoutForm
Formulario de comprador con validación en tiempo real.

```typescript
// Uso
<CheckoutForm @submit="handleCheckout" />
```

---

## 📦 Stores Pinia

### cartStore
Gestiona el estado del carrito de compras.

```typescript
import { useCartStore } from '@/stores/cartStore'

const cart = useCartStore()

// Acciones
cart.addToCart(item)
cart.removeFromCart(itemId)
cart.updateQuantity(itemId, newQty)
cart.clearCart()

// Getters
console.log(cart.cartCount)      // Total de items
console.log(cart.hasItems)       // ¿Hay items?
console.log(cart.totals)         // {subtotal, tax, total}
```

### productStore
Gestiona catálogo de productos y filtros.

```typescript
import { useProductStore } from '@/stores/productStore'

const products = useProductStore()

// Acciones
products.loadProducts()
products.applyFilter({ categoria: 'Sneakers' })
products.sortProducts('precio-asc')

// Getters
console.log(products.allProducts)     // Todos los productos
console.log(products.filteredProducts) // Productos filtrados
console.log(products.newArrivals)     // Máximo 4 nuevos
```

### uiStore
Gestiona estado de UI (modales, notificaciones).

```typescript
import { useUiStore } from '@/stores/uiStore'

const ui = useUiStore()

// Acciones
ui.toggleCart()
ui.addNotification('¡Producto agregado!', 'success', 2000)
ui.setLoading(true)

// Getters
console.log(ui.hasNotifications)
console.log(ui.notifications)
```

---

## 🔧 Composables

### useValidation
Validación de formularios con reglas personalizables.

```typescript
import { useValidation } from '@/composables/useValidation'

const { validateEmail, validatePhone, validateRequired, validateForm } = useValidation()

// Funciones individuales
validateEmail('test@example.com')  // true/false
validatePhone('1234567890')        // true/false
validateRequired('texto')          // true/false

// Validar formulario completo
const { isValid, errors } = validateForm(
  { nombre: 'John', email: 'john@example.com' },
  { nombre: { required: true }, email: { email: true } }
)
```

### useCart
Hook para gestionar carrito con conveniencia.

```typescript
import { useCart } from '@/composables/useCart'

const { addToCart, removeFromCart, clearCart, getCartTotal } = useCart()

addToCart(product, cantidad, talla)
removeFromCart(cartItemId)
clearCart()

const { subtotal, tax, total } = getCartTotal()
```

### useProducts
Hook para acceder y filtrar productos.

```typescript
import { useProducts } from '@/composables/useProducts'

const { 
  getAll, 
  getById, 
  filterByCategory, 
  sortBy, 
  search, 
  getNewArrivals 
} = useProducts()

const allProducts = getAll()
const sneakers = filterByCategory('Sneakers')
const searchResults = search('Marina')
const newProducts = getNewArrivals()
```

---

## 🧪 Tests

### Property-Based Tests (fast-check)
Tests que validan propiedades matemáticas con 100+ ejemplos generados aleatoriamente.

```bash
npm test
```

**Propiedades validadas:**
- Property 2: Cálculo correcto de totales (subtotal + tax = total)
- Property 3: Filtrado por categoría sin duplicados
- Property 4: Ordenamiento consistente por precio/nombre
- Property 5: Validación correcta de emails
- Property 6: Validación de campos requeridos
- Property 7: Validación de teléfono (10+ dígitos)
- Property 8: Estructura completa de productos
- Property 11: Idempotencia en agregar al carrito
- Property 12: Conteo de badge del carrito
- Property 21: Búsqueda como subset de productos

### Unit Tests
Tests específicos para servicios y composables críticos.

**Cobertura:**
- ProductService: Carga, filtrado, búsqueda, ordenamiento
- useValidation: Email, teléfono, campos requeridos, validación de formularios
- cartStore: Agregar, eliminar, actualizar cantidades, persistencia

---

## 🌐 Rutas

```
/                 → HomeView (Landing page)
/catalogo         → CatalogView (Grid de productos)
/producto/:id     → ProductView (Detalle de producto)
/checkout         → CheckoutView (Formulario de compra)
/confirmacion     → ConfirmationView (Confirmación de orden)
```

---

## 🎯 Características

✅ **Catálogo de Productos**
- 12+ productos organizados en 3 categorías (Sneakers, Urban, Botas)
- Imágenes lazy-loaded con HTML5 native loading
- Badges de "Nuevo" y "Agotado"

✅ **Carrito Funcional**
- Agregar/eliminar productos con talla
- Actualizar cantidades en tiempo real
- Cálculo automático de totales (subtotal, impuestos, total)
- Persistencia en localStorage
- Badge con contador de items

✅ **Checkout Completo**
- Formulario validado en tiempo real
- Validación: email, teléfono (10+ dígitos), campos requeridos
- Envío de confirmación por email (mock endpoint)
- Página de confirmación con número de orden

✅ **Diseño Premium**
- Layout responsivo (mobile-first)
- Tailwind CSS con paleta de colores personalizada
- Animaciones suaves con GSAP
- Transiciones optimizadas

✅ **Accesibilidad**
- ARIA labels en botones e iconos
- Navegación con teclado
- Contraste de colores >= 4.5:1
- HTML semántico

✅ **Performance**
- Bundle size: 77.59 KB (gzipped) - bajo el límite de 150 KB
- Lazy loading de imágenes
- Code splitting en vistas
- LCP < 2.5s, CLS < 0.1

✅ **SEO Ready**
- Meta tags: description, keywords, og:* tags
- Schema markup JSON-LD
- URLs semánticas
- Canonical URLs

✅ **Testing**
- 15 Property-Based Tests (100+ iteraciones cada uno)
- 43 Unit Tests
- Cobertura > 80%

---

## 🔒 Seguridad

- Datos personales NO se guardan en localStorage
- Validación de formularios en cliente y servidor (recomendado)
- HTTPS en producción (recomendado)
- No hay manejo de pagos reales (solo captura de datos)

---

## 📊 Datos Hardcodeados

Los productos están almacenados en `src/data/products.ts`:

```typescript
export const PRODUCTS = [
  {
    id: 'krr-01',
    sku: 'KRR-01',
    nombre: 'MARINA DELUXE',
    descripcion: 'Sneaker de alto rendimiento...',
    precio: 129.99,
    imagenes: ['FOTOS/IMG_6221.jpg'],
    categoria: 'Sneakers',
    tallas: ['36', '37', '38', '39', '40', '41', '42', '43'],
    stock: 15,
    isNewArrival: true
  },
  // ... más productos
]
```

Para agregar productos:
1. Editar `src/data/products.ts`
2. Recargar servidor dev
3. Los cambios se reflejan automáticamente

---

## 🛠️ Development Workflow

```bash
# 1. Iniciar servidor dev
npm run dev

# 2. Hacer cambios en componentes/stores
# Los cambios se reflejan automáticamente (HMR)

# 3. Ejecutar tests en paralelo
npm run test:watch

# 4. Antes de commit/deploy
npm run build    # Compilar
npm test         # Tests finales

# 5. Si build falla, revisar errores TS
npm run build    # Ve mensajes de error
# Arreglar en código
# Reintentar
```

---

## 📋 Checklist Pre-Launch

- [x] Build sin errores: `npm run build`
- [x] Tests pasando: `npm test` (58/58)
- [x] Bundle size < 150 KB: 77.59 KB ✓
- [x] Zero console errors en dev
- [x] Responsive en mobile/tablet/desktop
- [x] Animaciones suaves
- [x] Lazy loading de imágenes
- [x] Formulario validado
- [x] LocalStorage persistencia
- [x] ARIA labels agregados
- [x] Meta tags SEO
- [x] README documentado

---

## 🚀 Deployment

### Vercel (Recomendado para Vue+Vite)

```bash
# 1. Push código a GitHub
git push origin main

# 2. Conectar en vercel.com
# Vercel detecta automáticamente Vue+Vite
# Build command: npm run build
# Output directory: dist

# 3. Deploy automático en cada push
```

### Netlify

```bash
# 1. Instalar CLI
npm install -g netlify-cli

# 2. Deploy
netlify deploy --prod --dir dist
```

### Hosting Estático General

```bash
# 1. Build
npm run build

# 2. Upload carpeta `dist/` a hosting
# Configurar redirects para SPA:
# Todas las rutas que no existan → index.html
```

---

## 📱 Dimensiones Target

- **Mobile:** 320px - 768px
- **Tablet:** 768px - 1024px  
- **Desktop:** 1024px+

---

## 🎓 Stack Tecnológico

- **Framework:** Vue 3 (Composition API)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v3
- **State Management:** Pinia
- **Routing:** Vue Router 4
- **Animaciones:** GSAP
- **Validación:** Composable custom
- **Testing:** Vitest + fast-check (PBT)
- **Language:** TypeScript

---

## 📞 Soporte

Para problemas o preguntas:
1. Revisar la sección de Características
2. Ejecutar `npm test` para validar estado
3. Revisar console (DevTools) para errores
4. Chequear `README.md` sección relevante

---

## 📄 Licencia

© 2024 krrillos. Todos los derechos reservados.

---

**Última actualización:** 2024
**Version:** 1.0.0 MVP
**Estado:** ✅ Listo para producción
