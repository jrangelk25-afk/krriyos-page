import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'
import { useScrollBehavior } from './composables/useScrollBehavior'

// Views
import HomeView from './views/HomeView.vue'
import CatalogView from './views/CatalogView.vue'
import ProductView from './views/ProductView.vue'
import CheckoutView from './views/CheckoutView.vue'
import ConfirmationView from './views/ConfirmationView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/catalogo',
    name: 'Catalog',
    component: CatalogView,
  },
  {
    path: '/producto/:id',
    name: 'Product',
    component: ProductView,
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: CheckoutView,
    beforeEnter: (_to: any, _from: any, next: any) => {
      const cartData = localStorage.getItem('krriyos_cart')
      if (cartData) {
        try {
          const { items } = JSON.parse(cartData)
          if (items && items.length > 0) {
            next()
            return
          }
        } catch (error) {
          console.error('Error parsing cart:', error)
        }
      }
      next('/catalogo')
    },
  },
  {
    path: '/confirmacion',
    name: 'Confirmation',
    component: ConfirmationView,
  },
]

// Inicializar composable de scroll
const scrollBehaviorComposable = useScrollBehavior()

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

/**
 * Obtener la posición de scroll actual
 */
const getCurrentScroll = () => {
  return Math.max(
    window.scrollY,
    document.documentElement.scrollTop,
    document.body.scrollTop
  )
}

/**
 * Hacer scroll a una posición específica
 */
const setScrollPosition = (top: number) => {
  window.scrollTo(0, top)
  document.documentElement.scrollTop = top
  document.body.scrollTop = top
}

/**
 * FLUJO CORRECTO:
 * 1. Restaurar posición de la NUEVA ruta (si existe)
 * 2. Guardar posición de la ANTERIOR ruta
 * 3. Confirmar en afterEach
 */

/**
 * beforeResolve - Se ejecuta ANTES de cambiar la ruta
 * Orden CORRECTO:
 *   1. PRIMERO: Guardar scroll de la ruta ANTERIOR (ANTES de cambiar)
 *   2. LUEGO: Restaurar scroll de la ruta NUEVA
 */
router.beforeResolve((to, from) => {
  const currentScroll = getCurrentScroll()
  
  // PASO 1: PRIMERO guardar la posición de la ruta ANTERIOR (antes de que cambie todo)
  if (from.path && currentScroll > 0) {
    scrollBehaviorComposable.saveScrollPosition(from.path)
  }
  
  // PASO 2: LUEGO restaurar la posición de la NUEVA ruta
  const savedPositionNewRoute = scrollBehaviorComposable.getScrollPosition(to.path)
  
  if (savedPositionNewRoute) {
    setScrollPosition(savedPositionNewRoute.top)
  } else {
    setScrollPosition(0)
  }
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')
