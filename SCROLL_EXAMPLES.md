# 📚 Ejemplos de Uso del Sistema de Scroll

## Ejemplos Prácticos para Krriyos

---

## 1. Header con Navegación de Scroll

```vue
<!-- Header.vue -->
<template>
  <header class="header">
    <nav class="nav">
      <a href="#" @click.prevent="scrollToSection('hero')">Inicio</a>
      <a href="#" @click.prevent="scrollToSection('products')">Productos</a>
      <a href="#" @click.prevent="scrollToSection('contact')">Contacto</a>
    </nav>
  </header>

  <!-- Secciones con IDs -->
  <section id="hero">...</section>
  <section id="products">...</section>
  <section id="contact">...</section>
</template>

<script setup lang="ts">
import { usePageScroll } from '@/composables/usePageScroll'

const scroll = usePageScroll()

const scrollToSection = (sectionId: string) => {
  scroll.toElementWithOffset(`#${sectionId}`, 80) // 80px offset para sticky header
}
</script>

<style scoped>
header {
  position: sticky;
  top: 0;
  height: 80px;
  z-index: 100;
}
</style>
```

---

## 2. Catálogo con Filtros

```vue
<!-- CatalogView.vue -->
<template>
  <div class="catalog">
    <aside class="filters">
      <h3>Filtros</h3>
      <div class="filter-group">
        <button @click="filterBySize('S')">Pequeño</button>
        <button @click="filterBySize('M')">Mediano</button>
        <button @click="filterBySize('L')">Grande</button>
      </div>
    </aside>

    <main class="products">
      <div id="products-list">
        <ProductCard 
          v-for="product in filteredProducts" 
          :key="product.id"
          :product="product"
        />
      </div>
    </main>

    <ScrollToTopButton />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePageScroll } from '@/composables/usePageScroll'
import ScrollToTopButton from '@/components/ScrollToTopButton.vue'
import ProductCard from '@/components/ProductCard.vue'

const scroll = usePageScroll()
const selectedSize = ref<string | null>(null)
const products = ref([...]) // datos de productos

const filteredProducts = computed(() => {
  if (!selectedSize.value) return products.value
  return products.value.filter(p => p.size === selectedSize.value)
})

const filterBySize = async (size: string) => {
  selectedSize.value = size
  
  // Scroll suave a la lista de productos después de filtrar
  await scroll.toElementWithOffset('#products-list', 80)
}
</script>

<style scoped>
.catalog {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
  padding: 2rem;
}

.filters {
  position: sticky;
  top: 80px;
  height: fit-content;
}

.products {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}
</style>
```

---

## 3. Detalle de Producto con Tabs

```vue
<!-- ProductView.vue -->
<template>
  <div class="product-view">
    <div class="product-hero">
      <img :src="product.image" :alt="product.name" />
    </div>

    <div class="product-info">
      <h1>{{ product.name }}</h1>
      <p class="price">${{ product.price }}</p>
      
      <div class="tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab"
          @click="selectTab(tab)"
          :class="{ active: activeTab === tab }"
        >
          {{ tab }}
        </button>
      </div>

      <div id="tab-content" class="tab-content">
        <div v-show="activeTab === 'Descripción'">
          {{ product.description }}
        </div>
        <div v-show="activeTab === 'Especificaciones'">
          <ul>
            <li v-for="(value, key) in product.specs" :key="key">
              {{ key }}: {{ value }}
            </li>
          </ul>
        </div>
        <div v-show="activeTab === 'Reseñas'">
          <!-- Reseñas -->
        </div>
      </div>

      <button @click="addToCart" class="btn-add">Agregar al Carrito</button>
    </div>

    <ScrollToTopButton />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { usePageScroll } from '@/composables/usePageScroll'
import ScrollToTopButton from '@/components/ScrollToTopButton.vue'

const route = useRoute()
const scroll = usePageScroll()

const tabs = ['Descripción', 'Especificaciones', 'Reseñas']
const activeTab = ref(tabs[0])

// Cargar producto basado en route.params.id
const product = ref({
  name: 'Zapato Premium',
  price: 129.99,
  description: '...',
  image: '...',
  specs: { Material: 'Cuero', Color: 'Negro' },
})

const selectTab = async (tab: string) => {
  activeTab.value = tab
  
  // Scroll suave al contenido de la pestaña
  // Esperar a que Vue renderice la nueva pestaña
  await scroll.toElementWithOffset('#tab-content', 80)
}

const addToCart = () => {
  // Lógica para agregar al carrito
  console.log('Agregado al carrito')
}
</script>

<style scoped>
.product-view {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  padding: 2rem;
}

.tabs {
  display: flex;
  gap: 1rem;
  border-bottom: 2px solid #e0e0e0;
  margin: 2rem 0;
}

.tabs button {
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: border-color 0.3s;

  &.active {
    border-bottom-color: #667eea;
    color: #667eea;
  }
}

#tab-content {
  min-height: 200px;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
```

---

## 4. Checkout con Stepper

```vue
<!-- CheckoutView.vue -->
<template>
  <div class="checkout">
    <div class="stepper">
      <div 
        v-for="(step, index) in steps"
        :key="index"
        :class="['step', { active: currentStep === index, completed: currentStep > index }]"
        @click="goToStep(index)"
      >
        <div class="step-number">{{ index + 1 }}</div>
        <div class="step-label">{{ step }}</div>
      </div>
    </div>

    <div id="checkout-content" class="content">
      <template v-if="currentStep === 0">
        <ShippingForm @next="nextStep" />
      </template>
      <template v-else-if="currentStep === 1">
        <PaymentForm @next="nextStep" @back="prevStep" />
      </template>
      <template v-else-if="currentStep === 2">
        <ReviewOrder @back="prevStep" @submit="submitOrder" />
      </template>
    </div>

    <ScrollToTopButton />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePageScroll } from '@/composables/usePageScroll'
import ScrollToTopButton from '@/components/ScrollToTopButton.vue'
import ShippingForm from '@/components/CheckoutForm.vue'
import PaymentForm from '@/components/PaymentForm.vue'
import ReviewOrder from '@/components/ReviewOrder.vue'

const scroll = usePageScroll()
const steps = ['Envío', 'Pago', 'Revisión']
const currentStep = ref(0)

const nextStep = async () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
    await scroll.toElementWithOffset('#checkout-content', 80)
  }
}

const prevStep = async () => {
  if (currentStep.value > 0) {
    currentStep.value--
    await scroll.toElementWithOffset('#checkout-content', 80)
  }
}

const goToStep = async (stepIndex: number) => {
  if (stepIndex <= currentStep.value) {
    currentStep.value = stepIndex
    await scroll.toElementWithOffset('#checkout-content', 80)
  }
}

const submitOrder = async () => {
  // Procesar orden
  console.log('Orden enviada')
  // Redirigir a confirmación (el router maneja el scroll)
}
</script>

<style scoped>
.checkout {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.stepper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3rem;
  position: sticky;
  top: 80px;
  background: white;
  z-index: 50;
  padding: 1rem 0;
  border-bottom: 2px solid #e0e0e0;
}

.step {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.3s;

  &.active,
  &.completed {
    opacity: 1;
  }

  &.active .step-number {
    background: #667eea;
    color: white;
  }

  &.completed .step-number {
    background: #4caf50;
    color: white;
  }
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e0e0e0;
  font-weight: bold;
  transition: background 0.3s;
}

#checkout-content {
  animation: slideIn 0.3s ease-in;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
```

---

## 5. Hero con CTA Scroll

```vue
<!-- Hero.vue -->
<template>
  <section class="hero">
    <div class="hero-content">
      <h1>Zapatos Premium Krriyos</h1>
      <p>Descubre nuestra colección exclusiva</p>
      <button @click="scrollToProducts" class="cta-btn">
        Ver Catálogo
        <svg class="arrow-down" viewBox="0 0 24 24">
          <path d="M12 16l-7-7h14z" fill="currentColor" />
        </svg>
      </button>
    </div>
    <img class="hero-image" src="@/assets/hero.png" alt="Hero" />
  </section>
</template>

<script setup lang="ts">
import { usePageScroll } from '@/composables/usePageScroll'

const scroll = usePageScroll()

const scrollToProducts = () => {
  scroll.toElementWithOffset('#products-section', 80)
}
</script>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  padding: 4rem 2rem;
  min-height: 80vh;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  width: fit-content;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: bold;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  .arrow-down {
    width: 1.2rem;
    height: 1.2rem;
    animation: bounce 2s infinite;
  }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(8px); }
}
</style>
```

---

## 6. Footer con Links de Scroll

```vue
<!-- Footer.vue -->
<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3>Enlaces Rápidos</h3>
        <ul>
          <li><a href="#" @click.prevent="goToSection('inicio')">Inicio</a></li>
          <li><a href="#" @click.prevent="goToSection('productos')">Productos</a></li>
          <li><router-link to="/catalogo">Catálogo</router-link></li>
          <li><a href="#" @click.prevent="goToSection('contacto')">Contacto</a></li>
        </ul>
      </div>

      <div class="footer-section">
        <h3>Información</h3>
        <ul>
          <li><a href="#">Sobre Nosotros</a></li>
          <li><a href="#">Políticas de Privacidad</a></li>
          <li><a href="#">Términos de Servicio</a></li>
          <li><a href="#">Preguntas Frecuentes</a></li>
        </ul>
      </div>

      <div class="footer-section">
        <h3>Contacto</h3>
        <p>Email: info@krriyos.com</p>
        <p>Teléfono: +1 234 567 8900</p>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; 2024 Krriyos. Todos los derechos reservados.</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { usePageScroll } from '@/composables/usePageScroll'

const scroll = usePageScroll()

const goToSection = (sectionId: string) => {
  scroll.toElementWithOffset(`#${sectionId}`, 80)
}
</script>

<style scoped>
.footer {
  background: #2c3e50;
  color: white;
  padding: 3rem 2rem;
  margin-top: 4rem;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto 2rem;
}

.footer-section h3 {
  margin-bottom: 1rem;
  color: #667eea;
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section li {
  margin: 0.5rem 0;
}

.footer-section a {
  color: #bdc3c7;
  text-decoration: none;
  transition: color 0.3s;

  &:hover {
    color: #667eea;
  }
}

.footer-bottom {
  text-align: center;
  border-top: 1px solid #34495e;
  padding-top: 1rem;
  color: #95a5a6;
}
</style>
```

---

## 7. Modal con Scroll Suave

```vue
<!-- Modal.vue -->
<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click="close">
      <div class="modal" @click.stop>
        <button class="close-btn" @click="close">✕</button>
        
        <div id="modal-content" class="modal-content">
          <slot />
        </div>

        <div class="modal-actions">
          <button @click="close" class="btn-secondary">Cancelar</button>
          <button @click="confirm" class="btn-primary">Confirmar</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePageScroll } from '@/composables/usePageScroll'

const scroll = usePageScroll()
const props = defineProps<{
  isOpen: boolean
  onConfirm: () => void
}>()

const emit = defineEmits<{
  close: []
}>()

const close = () => {
  emit('close')
}

const confirm = () => {
  props.onConfirm()
  close()
}

// Scroll dentro del modal al abrirse
const scrollToContentStart = () => {
  scroll.toPosition(0)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;

  &:hover {
    color: #333;
  }
}

#modal-content {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  padding: 1rem 2rem;
  border-top: 1px solid #e0e0e0;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
```

---

## 8. Lazy Loading con Scroll

```vue
<!-- InfiniteScroll.vue -->
<template>
  <div class="infinite-scroll">
    <div v-for="item in items" :key="item.id" class="item">
      {{ item.title }}
    </div>

    <div v-if="isLoading" class="loading">Cargando más...</div>
    <div v-if="hasNoMore" class="end-message">No hay más items</div>

    <div ref="sentinelElement" class="sentinel" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const items = ref<Array<{ id: number; title: string }>>([])
const isLoading = ref(false)
const hasNoMore = ref(false)
const sentinelElement = ref<HTMLElement | null>(null)

let observer: IntersectionObserver

const loadMore = async () => {
  if (isLoading.value || hasNoMore.value) return

  isLoading.value = true

  try {
    // Simular carga de API
    await new Promise(resolve => setTimeout(resolve, 500))

    const newItems = Array.from({ length: 10 }, (_, i) => ({
      id: items.value.length + i,
      title: `Item ${items.value.length + i}`,
    }))

    items.value.push(...newItems)

    // Verificar si hay más items (simulado)
    if (items.value.length > 100) {
      hasNoMore.value = true
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  // Intersection Observer para infinite scroll
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadMore()
      }
    },
    { threshold: 0.5 }
  )

  if (sentinelElement.value) {
    observer.observe(sentinelElement.value)
  }
})

onUnmounted(() => {
  observer.disconnect()
})
</script>

<style scoped>
.infinite-scroll {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  padding: 2rem;
}

.item {
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: white;
}

.loading,
.end-message {
  grid-column: 1 / -1;
  text-align: center;
  padding: 2rem;
  color: #999;
}

.sentinel {
  grid-column: 1 / -1;
  height: 1px;
}
</style>
```

---

Estos ejemplos muestran cómo integrar el sistema de scroll en diferentes contextos reales de la aplicación Krriyos.
