import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'

// Views
import HomeView from './views/HomeView.vue'
import CatalogView from './views/CatalogView.vue'
import OutletView from './views/OutletView.vue'
import NewArrivalsView from './views/NewArrivalsView.vue'
import ProductView from './views/ProductView.vue'
import CheckoutView from './views/CheckoutView.vue'
import ConfirmationView from './views/ConfirmationView.vue'
import AboutView from './views/AboutView.vue'
import AdminLoginView from './views/admin/AdminLogin.vue'
import AdminDashboard from './views/admin/AdminDashboard.vue'
import AdminProducts from './views/admin/AdminProducts.vue'
import AdminCategories from './views/admin/AdminCategories.vue'
import AdminOrders from './views/admin/AdminOrders.vue'
import AdminOrderDetail from './views/admin/AdminOrderDetail.vue'
import AdminCustomers from './views/admin/AdminCustomers.vue'
import AdminUsers from './views/admin/AdminUsers.vue'
import AdminAuditLogs from './views/admin/AdminAuditLogs.vue'
import AdminSettings from './views/admin/AdminSettings.vue'

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
    path: '/outlet',
    name: 'Outlet',
    component: OutletView,
  },
  {
    path: '/nuevos',
    name: 'NewArrivals',
    component: NewArrivalsView,
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
  {
    path: '/nosotros',
    name: 'About',
    component: AboutView,
  },
  // Admin Routes
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLoginView,
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
  },
  {
    path: '/admin/products',
    name: 'AdminProducts',
    component: AdminProducts,
  },
  {
    path: '/admin/products/:id/edit',
    name: 'AdminProductEdit',
    component: () => import('./views/admin/AdminProductEdit.vue'),
  },
  {
    path: '/admin/categories',
    name: 'AdminCategories',
    component: AdminCategories,
  },
  {
    path: '/admin/orders',
    name: 'AdminOrders',
    component: AdminOrders,
  },
  {
    path: '/admin/orders/:id',
    name: 'AdminOrderDetail',
    component: AdminOrderDetail,
  },
  {
    path: '/admin/customers',
    name: 'AdminCustomers',
    component: AdminCustomers,
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: AdminUsers,
  },
  {
    path: '/admin/audit-logs',
    name: 'AdminAuditLogs',
    component: AdminAuditLogs,
  },
  {
    path: '/admin/settings',
    name: 'AdminSettings',
    component: AdminSettings,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Middleware de protección para rutas admin
router.beforeEach((_to, _from) => {
  // La validación de autenticación se hace en el componente AdminLayout
  // Solo permitimos pasar y el componente checa en onMounted
})

/**
 * Hacer scroll a una posición específica
 */
const setScrollPosition = (top: number) => {
  window.scrollTo(0, top)
  document.documentElement.scrollTop = top
  document.body.scrollTop = top
}

/**
 * beforeResolve - Se ejecuta ANTES de cambiar la ruta
 * Siempre va al inicio de la página
 */
router.beforeResolve(() => {
  // Siempre ir al inicio de la página cuando se cambia de ruta
  setScrollPosition(0)
})

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Inicializar datos del store cuando se monta la app
import { useProductStore } from './stores/productStore'

const initializeApp = async () => {
  const productStore = useProductStore()
  
  // Cargar datos si no están ya cargados
  if (productStore.allProducts.length === 0) {
    try {
      await productStore.loadCategories()
      await productStore.loadProducts()
    } catch (error) {
      console.error('Error initializing app data:', error)
    }
  }
}

// Ejecutar inicialización antes de montar
initializeApp().then(() => {
  app.mount('#app')
})
