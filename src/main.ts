import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import './style.css'
import App from './App.vue'

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

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')
