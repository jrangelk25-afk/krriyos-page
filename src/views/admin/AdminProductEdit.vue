<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AdminLayout from '../../components/admin/AdminLayout.vue'
import ProductImageGallery from '../../components/admin/ProductImageGallery.vue'
import SizeInventoryManager from '../../components/admin/SizeInventoryManager.vue'
import { getProduct, updateProduct, fetchCategories } from '../../lib/adminApi'
import { useAuthStore } from '../../stores/authStore'
import type { ProductSizeInventory } from '../../types'

interface Category {
  id: string
  name: string
}

interface ProductColor {
  id: string
  name: string
  hexCode: string
}

interface ProductImage {
  id: string
  imageUrl: string
  displayOrder: number
  isPrimary: boolean
}

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const loading = ref(true)
const error = ref<string | null>(null)
const formError = ref<string | null>(null)
const saving = ref(false)
const categories = ref<Category[]>([])
const productColors = ref<ProductColor[]>([])
const sizeInventoryManagerRef = ref<any>(null)

const showColorModal = ref(false)
const newColor = ref({
  name: '',
  hexCode: '#000000'
})

const formData = ref({
  id: '',
  name: '',
  sku: '',
  price: '',
  stock: 0,
  categoryId: '',
  description: '',
  isActive: true,
  isNewArrival: false,
  isOutlet: false,
})

const productImages = ref<ProductImage[]>([])
const productSizes = ref<ProductSizeInventory[]>([])

const fetchData = async () => {
  try {
    loading.value = true
    const productId = route.params.id as string
    console.log('Fetching product:', productId)

    const [productData, categoriesData] = await Promise.all([
      getProduct(productId),
      fetchCategories(),
    ])

    console.log('🔍 Product data received:')
    console.log('   - ID:', productData.id)
    console.log('   - Name:', productData.name)
    console.log('   - Sizes array:', productData.sizes)
    console.log('   - Sizes length:', productData.sizes?.length)
    console.log('   - Sizes is array:', Array.isArray(productData.sizes))
    if (productData.sizes && Array.isArray(productData.sizes)) {
      console.log('   - First size:', productData.sizes[0])
    }

    formData.value = {
      id: productData.id,
      name: productData.name,
      sku: productData.sku,
      price: productData.price.toString(),
      stock: productData.stock,
      categoryId: productData.categoryId,
      description: productData.description || '',
      isActive: productData.isActive,
      isNewArrival: productData.isNewArrival,
      isOutlet: productData.isOutlet,
    }

    // Procesar colores
    if (productData.colors && Array.isArray(productData.colors)) {
      productColors.value = productData.colors
    }

    // Procesar imágenes
    if (productData.images && Array.isArray(productData.images) && productData.images.length > 0) {
      productImages.value = productData.images.map((img: any) => ({
        id: img.id,
        imageUrl: img.imageUrl,
        displayOrder: img.displayOrder || 0,
        isPrimary: img.isPrimary || false,
      }))
      console.log('✅ Images loaded successfully:', productImages.value)
    } else {
      console.warn('⚠️ No images found in product data:', productData.images)
    }

    // Procesar tallas
    console.log('📦 Processing sizes...')
    if (productData.sizes && Array.isArray(productData.sizes) && productData.sizes.length > 0) {
      productSizes.value = productData.sizes.map((size: any) => {
        // Extraer los colorIds desde la relación ProductSizeColor
        const colorIds = size.colors && Array.isArray(size.colors)
          ? size.colors.map((sizeColor: any) => sizeColor.color?.id).filter(Boolean)
          : []
        
        console.log(`Size ${size.size}:`, {
          id: size.id,
          colors: size.colors,
          colorIds: colorIds,
        })
        
        return {
          id: size.id,
          size: size.size,
          quantity: size.stock || 0,
          colorIds: colorIds, // Array de IDs de colores vinculados
        }
      })
      console.log('✅ Sizes loaded successfully:')
      console.log('   - Total sizes:', productSizes.value.length)
      console.log('   - Sizes data:', productSizes.value)
    } else {
      console.warn('⚠️ No sizes found in product data', {
        sizes: productData.sizes,
        isArray: Array.isArray(productData.sizes),
        length: productData.sizes?.length,
      })
      productSizes.value = []
    }

    categories.value = categoriesData
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error fetching product'
    console.error('❌ Error fetching product:', err)
  } finally {
    loading.value = false
  }
}

const handleImagesUpdate = (updatedImages: ProductImage[]) => {
  productImages.value = updatedImages
}

const handleAddSize = (size: ProductSizeInventory) => {
  productSizes.value.push(size)
}

const handleRemoveSize = (sizeId: string) => {
  productSizes.value = productSizes.value.filter(s => s.id !== sizeId)
}

const addColor = () => {
  if (!newColor.value.name.trim()) {
    alert('El nombre del color es requerido')
    return
  }

  const newColorObj = {
    id: `new-${Date.now()}`,
    name: newColor.value.name,
    hexCode: newColor.value.hexCode,
  }

  productColors.value.push(newColorObj)
  newColor.value = { name: '', hexCode: '#000000' }
  showColorModal.value = false
}

const deleteColor = (colorId: string) => {
  if (confirm('¿Estás seguro de que deseas eliminar este color? Las tallas asociadas también se eliminarán.')) {
    productColors.value = productColors.value.filter(c => c.id !== colorId)
    productSizes.value = productSizes.value.filter(s => s.colorId !== colorId)
  }
}

const handleSubmit = async () => {
  try {
    saving.value = true
    formError.value = null

    // Validaciones de campos básicos (siempre requeridos)
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

    // Validar imágenes solo si el producto está activo
    if (formData.value.isActive && productImages.value.length === 0) {
      formError.value = 'Debe haber al menos una imagen del producto'
      return
    }

    console.log('ProductSizes before mapping:', productSizes.value)
    
    // IMPORTANTE: Obtener las tallas actualizadas del SizeInventoryManager
    const actualSizes = sizeInventoryManagerRef.value?.localSizes || productSizes.value
    console.log('🎯 Actual sizes from component:', actualSizes)
    
    // Calcular stock total (0 si no hay tallas)
    const totalStock = actualSizes.length > 0
      ? actualSizes.reduce((sum: number, s: any) => sum + (s.quantity || 0), 0)
      : 0

    // Si hay tallas sin color asignado, asignar el primer color automáticamente
    const sizesWithoutColors = actualSizes.map((size: any) => ({
      id: size.id,
      size: size.size,
      stock: size.quantity || 0,
      colorIds: size.colorIds || [],
    }))

    const updatePayload = {
      name: formData.value.name,
      sku: formData.value.sku,
      price: parseFloat(formData.value.price),
      stock: totalStock,
      categoryId: formData.value.categoryId,
      description: formData.value.description,
      isActive: formData.value.isActive,
      isNewArrival: formData.value.isNewArrival,
      isOutlet: formData.value.isOutlet,
      images: productImages.value.map(img => ({
        id: img.id,
        imageUrl: img.imageUrl,
        displayOrder: img.displayOrder,
        isPrimary: img.isPrimary,
      })),
      colors: productColors.value.map((color, index) => ({
        id: color.id,
        name: color.name,
        hexCode: color.hexCode,
        displayOrder: index,
      })),
      sizes: sizesWithoutColors,
    }
    
    console.log('UpdatePayload sizes:', updatePayload.sizes)
    console.log('UpdatePayload colors:', updatePayload.colors)
    console.log('UpdatePayload JSON:', JSON.stringify(updatePayload, null, 2))

    const response = await updateProduct(formData.value.id, updatePayload)
    console.log('Response from server:', response)
    router.push('/admin/products')
  } catch (err) {
    formError.value = err instanceof Error ? err.message : 'Error updating product'
  } finally {
    saving.value = false
  }
}

const goBack = () => {
  router.push('/admin/products')
}

onMounted(fetchData)
</script>

<template>
  <AdminLayout>
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Editar Producto</h1>
          <p class="mt-2 text-gray-600">Actualiza los detalles del producto</p>
        </div>
        <button
          @click="goBack"
          class="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
        >
          <span class="material-symbols-outlined">arrow_back</span>
          Volver
        </button>
      </div>

      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="text-gray-500">Cargando producto...</div>
      </div>

      <div v-else class="bg-white rounded-lg border border-gray-200 p-8">
        <div v-if="formError" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p class="text-red-800">{{ formError }}</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6 max-w-3xl">
          <!-- Nombre -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Nombre del Producto *</label>
            <input
              v-model="formData.name"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <!-- SKU -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">SKU *</label>
            <input
              v-model="formData.sku"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              required
            />
          </div>

          <!-- Categoría -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Categoría *</label>
            <select
              v-model="formData.categoryId"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Stock</label>
              <input
                v-model.number="formData.stock"
                type="number"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>
          </div>

          <!-- Descripción -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Descripción</label>
            <textarea
              v-model="formData.description"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
            ></textarea>
          </div>

          <!-- Imagen del Producto -->
          <div>
            <ProductImageGallery
              :images="productImages"
              @update="handleImagesUpdate"
            />
          </div>

          <!-- Gestión de Colores -->
          <div class="border-t pt-6">
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold text-gray-900">Colores del Producto</h3>
                <button
                  @click="showColorModal = true"
                  type="button"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <span class="material-symbols-outlined text-lg">add</span>
                  Agregar Color
                </button>
              </div>

              <div v-if="productColors.length > 0" class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                <div
                  v-for="color in productColors"
                  :key="color.id"
                  class="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div
                    class="w-8 h-8 rounded border-2 border-gray-300"
                    :style="{ backgroundColor: color.hexCode }"
                  />
                  <span class="flex-1 text-sm font-medium text-gray-700">{{ color.name }}</span>
                  <button
                    @click="deleteColor(color.id)"
                    type="button"
                    class="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Eliminar"
                  >
                    <span class="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
              <div v-else class="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                <p class="text-sm">No hay colores agregados. Agrega al menos uno para crear variantes.</p>
              </div>
            </div>
          </div>

          <!-- Gestión de Tallas - NUEVA VERSION -->
          <div class="border-t pt-6">
            <SizeInventoryManager
              ref="sizeInventoryManagerRef"
              :sizes="productSizes"
              :colors="productColors"
              @add="handleAddSize"
              @remove="handleRemoveSize"
            />
          </div>

          <!-- Checkboxes -->
          <div class="space-y-3 bg-gray-50 p-4 rounded-lg">
            <div class="flex items-center gap-3">
              <input
                v-model="formData.isNewArrival"
                type="checkbox"
                id="isNewArrival"
                class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
                class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
                class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
              @click="goBack"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal para agregar color -->
    <div v-if="showColorModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 space-y-4">
        <h3 class="text-lg font-bold text-gray-900">Agregar Color</h3>

        <!-- Nombre del Color -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Nombre del Color *</label>
          <input
            v-model="newColor.name"
            type="text"
            placeholder="Ej: Rojo, Azul, Negro"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Código de Color -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Código de Color (Hex) *</label>
          <div class="flex gap-2">
            <input
              v-model="newColor.hexCode"
              type="color"
              class="w-12 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <input
              v-model="newColor.hexCode"
              type="text"
              placeholder="#000000"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>
        </div>

        <!-- Botones -->
        <div class="flex gap-3">
          <button
            @click="showColorModal = false"
            type="button"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            @click="addColor"
            type="button"
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Agregar Color
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
