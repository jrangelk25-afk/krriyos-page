<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '../../components/admin/AdminLayout.vue'
import { fetchProducts, deleteProduct, createProduct, fetchCategories } from '../../lib/adminApi'
import { uploadImage } from '../../services/supabaseStorage'
import { useAuthStore } from '../../stores/authStore'

interface Product {
  id: string
  sku: string
  name: string
  price: string | number
  discountPercentage?: number
  stock: number
  isActive: boolean
  isNewArrival: boolean
  isOutlet: boolean
  categoryId?: string
  category?: { name: string }
}

interface Category {
  id: string
  name: string
}

const router = useRouter()
const authStore = useAuthStore()
const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const showModal = ref(false)
const formError = ref<string | null>(null)
const formData = ref({
  name: '',
  sku: '',
  price: '',
  stock: 0,
  categoryId: '',
  description: '',
  isActive: true,
  isNewArrival: false,
  isOutlet: false,
  imageFiles: [] as File[],
  imagePreviews: [] as string[],
})

const fetchData = async () => {
  try {
    loading.value = true
    const [productsData, categoriesData] = await Promise.all([
      fetchProducts(),
      fetchCategories(),
    ])
    products.value = productsData
    categories.value = categoriesData
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error fetching data'
  } finally {
    loading.value = false
  }
}

const openModal = () => {
  formData.value = {
    name: '',
    sku: '',
    price: '',
    stock: 0,
    categoryId: '',
    description: '',
    isActive: true,
    isNewArrival: false,
    isOutlet: false,
    imageFiles: [],
    imagePreviews: [],
  }
  formError.value = null
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  formError.value = null
}

const generateSKU = () => {
  if (formData.value.name.trim()) {
    const name = formData.value.name.substring(0, 3).toUpperCase()
    const random = Math.random().toString(36).substring(2, 5).toUpperCase()
    formData.value.sku = `${name}-${random}`
  }
}

const handleSubmit = async () => {
  try {
    formError.value = null
    if (!formData.value.name.trim()) {
      formError.value = 'El nombre es requerido'
      return
    }
    if (!formData.value.sku.trim()) {
      formError.value = 'El SKU es requerido'
      return
    }
    if (!formData.value.price || parseFloat(formData.value.price) <= 0) {
      formError.value = 'El precio debe ser mayor a 0'
      return
    }
    if (!formData.value.categoryId) {
      formError.value = 'Selecciona una categoría'
      return
    }

    // Crear producto sin imágenes
    const productData = {
      name: formData.value.name,
      sku: formData.value.sku,
      price: parseFloat(formData.value.price),
      stock: formData.value.stock,
      categoryId: formData.value.categoryId,
      description: formData.value.description,
      isActive: formData.value.isActive,
      isNewArrival: formData.value.isNewArrival,
      isOutlet: formData.value.isOutlet,
    }

    const created = await createProduct(productData)
    
    // Subir imágenes y asociarlas al producto
    if (formData.value.imageFiles.length > 0) {
      for (let i = 0; i < formData.value.imageFiles.length; i++) {
        const file = formData.value.imageFiles[i]
        const imageUrl = await uploadImage(file, 'products')
        
        if (!imageUrl) {
          continue
        }

        // Crear registro de imagen en BD
        try {
          const response = await fetch('/api/admin/products/images', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authStore.token}`,
            },
            body: JSON.stringify({
              productId: created.id,
              imageUrl: imageUrl,
              displayOrder: i,
              isPrimary: i === 0, // Primera imagen como miniatura
            }),
          })

          if (!response.ok) {
            const error = await response.json()
          }
        } catch (err) {
          // Error handling
        }
      }
    }

    products.value.push(created)
    closeModal()
  } catch (err) {
    formError.value = err instanceof Error ? err.message : 'Error creating product'
  }
}

const handleDelete = async (id: string) => {
  if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
    try {
      await deleteProduct(id)
      products.value = products.value.filter(p => p.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error deleting product'
    }
  }
}

const goToEdit = (id: string) => {
  router.push(`/admin/products/${id}/edit`)
}

onMounted(fetchData)

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value)
}

const handleImageSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (files) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) {
        formError.value = 'Por favor selecciona solo imágenes'
        return
      }
      if (file.size > 11 * 1024 * 1024) {
        formError.value = 'Cada imagen no debe superar 11MB'
        return
      }
      
      formData.value.imageFiles.push(file)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        formData.value.imagePreviews.push(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
}

const removeImage = (index: number) => {
  formData.value.imageFiles.splice(index, 1)
  formData.value.imagePreviews.splice(index, 1)
}
</script>

<template>
  <AdminLayout>
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Productos</h1>
          <p class="mt-2 text-sm sm:text-base text-gray-600">Gestiona tu catálogo de productos</p>
        </div>
        <button
          @click="openModal()"
          class="bg-blue-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base whitespace-nowrap"
        >
          <span class="material-symbols-outlined text-lg">add</span>
          <span class="hidden sm:inline">Nuevo</span>
          <span class="sm:hidden">+</span>
        </button>
      </div>

      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="text-gray-500">Cargando productos...</div>
      </div>

      <div v-else-if="products.length === 0" class="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p class="text-gray-600">No hay productos registrados</p>
      </div>

      <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Imagen</th>
                <th class="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">SKU</th>
                <th class="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Nombre</th>
                <th class="hidden md:table-cell px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Categoría</th>
                <th class="hidden lg:table-cell px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Precio</th>
                <th class="hidden lg:table-cell px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Descuento</th>
                <th class="hidden lg:table-cell px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Stock</th>
                <th class="hidden md:table-cell px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Estado</th>
                <th class="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-right text-xs sm:text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="product in products" :key="product.id" class="hover:bg-gray-50">
                <td class="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
                  <img 
                    v-if="(product as any).images?.[0]?.imageUrl"
                    :src="(product as any).images[0].imageUrl" 
                    :alt="product.name"
                    class="h-8 w-8 sm:h-10 sm:w-10 object-cover rounded"
                  />
                  <div v-else class="h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 rounded flex items-center justify-center">
                    <span class="material-symbols-outlined text-xs sm:text-sm text-gray-400">image</span>
                  </div>
                </td>
                <td class="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm font-mono text-gray-600">{{ product.sku }}</td>
                <td class="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm text-gray-900">{{ product.name }}</td>
                <td class="hidden md:table-cell px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm text-gray-600">{{ product.category?.name || 'N/A' }}</td>
                <td class="hidden lg:table-cell px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm font-medium text-gray-900">{{ formatCurrency(parseFloat(String(product.price))) }}</td>
                <td class="hidden lg:table-cell px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm">
                  <span v-if="product.isOutlet && product.discountPercentage" class="px-2 py-1 bg-red-100 text-red-800 rounded-full font-bold">
                    -{{ product.discountPercentage }}%
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="hidden lg:table-cell px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm text-gray-600">{{ product.stock }}</td>
                <td class="hidden md:table-cell px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm">
                  <span :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  ]">
                    {{ product.isActive ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm text-right space-x-1 sm:space-x-2">
                  <button
                    @click="goToEdit(product.id)"
                    class="text-blue-600 hover:text-blue-800 transition-colors"
                    title="Editar"
                  >
                    <span class="material-symbols-outlined text-base sm:text-lg">edit</span>
                  </button>
                  <button
                    @click="handleDelete(product.id)"
                    class="text-red-600 hover:text-red-800 transition-colors"
                    title="Eliminar"
                  >
                    <span class="material-symbols-outlined text-base sm:text-lg">delete</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Crear Producto -->
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div class="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6">
            <h2 class="text-2xl font-bold text-white">Nuevo Producto</h2>
          </div>

          <div class="px-8 py-6 max-h-[70vh] overflow-y-auto">
            <div v-if="formError" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p class="text-red-800 text-sm">{{ formError }}</p>
            </div>

            <form @submit.prevent="handleSubmit" class="space-y-5">
              <!-- Nombre -->
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">Nombre del Producto *</label>
                <input
                  v-model="formData.name"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ej: Zapatilla deportiva premium"
                  required
                />
              </div>

              <!-- SKU -->
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">SKU *</label>
                <div class="flex gap-2">
                  <input
                    v-model="formData.sku"
                    type="text"
                    class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                    placeholder="ZAP-001"
                    required
                  />
                  <button
                    type="button"
                    @click="generateSKU"
                    class="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                    title="Generar SKU"
                  >
                    Auto
                  </button>
                </div>
                <p class="text-xs text-gray-500 mt-1">Código único del producto</p>
              </div>

              <!-- Categoría -->
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">Categoría *</label>
                <select
                  v-model="formData.categoryId"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>

              <!-- Precio y Stock -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Precio (COP) *</label>
                  <input
                    v-model="formData.price"
                    type="number"
                    step="0.01"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Stock</label>
                  <input
                    v-model.number="formData.stock"
                    type="number"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                  />
                </div>
              </div>

              <!-- Descripción -->
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">Descripción</label>
                <textarea
                  v-model="formData.description"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows="3"
                  placeholder="Descripción detallada del producto..."
                ></textarea>
              </div>

              <!-- Imagen del Producto -->
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">Imágenes del Producto (múltiples)</label>
                <div v-if="formData.imagePreviews.length > 0" class="mb-4 grid grid-cols-3 gap-2">
                  <div v-for="(preview, index) in formData.imagePreviews" :key="index" class="relative">
                    <img 
                      :src="preview" 
                      :alt="`Preview ${index + 1}`"
                      class="w-full h-24 object-cover rounded-lg border-2 border-green-500"
                    />
                    <div v-if="index === 0" class="absolute top-1 left-1 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                      Miniatura
                    </div>
                    <button
                      type="button"
                      @click="removeImage(index)"
                      class="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      title="Remover imagen"
                    >
                      <span class="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                </div>
                <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50 mb-4">
                  <span class="material-symbols-outlined text-4xl text-gray-400 block mb-2">image</span>
                  <p class="text-sm text-gray-600">Arrastra imágenes o haz clic para seleccionar</p>
                  <p class="text-xs text-gray-500 mt-1">La primera será la miniatura</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  @change="handleImageSelect"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p class="text-xs text-gray-500 mt-1">Formatos: JPG, PNG, WebP. Máximo 11MB por imagen. Puedes subir varias.</p>
              </div>

              <!-- Checkboxes -->
              <div class="space-y-3 bg-gray-50 p-4 rounded-lg">
                <div class="flex items-center gap-3">
                  <input
                    v-model="formData.isNewArrival"
                    type="checkbox"
                    id="isNewArrival"
                    class="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500 cursor-pointer"
                  />
                  <label for="isNewArrival" class="text-sm font-medium text-gray-700 cursor-pointer">
                    Marcar como nuevo arribo
                  </label>
                </div>
                <div class="flex items-center gap-3">
                  <input
                    v-model="formData.isOutlet"
                    type="checkbox"
                    id="isOutlet"
                    class="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500 cursor-pointer"
                  />
                  <label for="isOutlet" class="text-sm font-medium text-gray-700 cursor-pointer">
                    Marcar como outlet (descuento)
                  </label>
                </div>
                <div class="flex items-center gap-3">
                  <input
                    v-model="formData.isActive"
                    type="checkbox"
                    id="isActive"
                    class="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500 cursor-pointer"
                  />
                  <label for="isActive" class="text-sm font-medium text-gray-700 cursor-pointer">
                    Producto activo
                  </label>
                </div>
              </div>

              <!-- Botones -->
              <div class="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  @click="closeModal"
                  class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  Crear Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
