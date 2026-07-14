<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { ProductSizeInventory } from '../../types'

interface Color {
  id: string
  name: string
  hexCode: string
}

const props = defineProps<{
  sizes: ProductSizeInventory[]
  colors: Color[]
}>()

const emit = defineEmits<{
  add: [size: ProductSizeInventory]
  remove: [sizeId: string]
}>()

// Estado local para ediciones sin guardar automático
const localSizes = ref<ProductSizeInventory[]>([])

// Sincronizar con props SOLO cuando se monta, NO con deep watch
watch(() => props.sizes, (newSizes) => {
  console.log('👀 SizeInventoryManager initialized with sizes')
  console.log('   - Sizes:', newSizes)
  localSizes.value = JSON.parse(JSON.stringify(newSizes || []))
}, { immediate: true })

// Calcular estadísticas
const stats = computed(() => ({
  totalStock: localSizes.value.reduce((sum, s) => sum + (s.quantity || 0), 0),
  totalVariants: localSizes.value.length,
  uniqueSizes: [...new Set(localSizes.value.map(s => s.size))],
  uniqueColors: [...new Set(localSizes.value.map(s => s.colorId).filter(Boolean))].length,
}))

// Exponer el estado local para que el padre pueda acceder
const getLocalSizes = () => localSizes.value

// Exponer el estado local directamente
defineExpose({
  localSizes,
})

// Tallas de calzado (rango de 33 a 43)
const NUMERIC_SIZES = Array.from({ length: 11 }, (_, i) => String(33 + i))

const showModal = ref(false)
const selectedSizes = ref<string[]>([])
const modalForm = ref({
  colorId: '',
  stock: 0,
})

const openModal = () => {
  selectedSizes.value = []
  modalForm.value = {
    colorId: '',
    stock: 0,
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedSizes.value = []
}

const toggleSize = (size: string) => {
  const index = selectedSizes.value.indexOf(size)
  if (index >= 0) {
    selectedSizes.value.splice(index, 1)
  } else {
    selectedSizes.value.push(size)
  }
}

const selectAllSizes = () => {
  selectedSizes.value = [...NUMERIC_SIZES]
}

const clearAllSizes = () => {
  selectedSizes.value = []
}

const getColorName = (colorId?: string) => {
  if (!colorId) return 'Genérica'
  return props.colors.find(c => c.id === colorId)?.name || 'Desconocido'
}

const getColorHex = (colorId?: string) => {
  if (!colorId) return '#e5e7eb'
  return props.colors.find(c => c.id === colorId)?.hexCode || '#e5e7eb'
}

const handleAddSizes = () => {
  if (selectedSizes.value.length === 0) {
    alert('Selecciona al menos una talla')
    return
  }

  if (modalForm.value.stock < 0) {
    alert('La cantidad no puede ser negativa')
    return
  }

  selectedSizes.value.forEach(size => {
    // Validar duplicados
    const isDuplicate = localSizes.value.some(
      s => s.size === size && s.colorId === (modalForm.value.colorId || null)
    )

    if (isDuplicate) {
      alert(`La talla ${size} con este color ya existe`)
      return
    }

    const newSize: ProductSizeInventory = {
      id: `new-${Date.now()}-${size}`,
      size,
      colorId: modalForm.value.colorId || undefined,
      colorName: getColorName(modalForm.value.colorId),
      quantity: modalForm.value.stock,
    }

    emit('add', newSize)
    localSizes.value.push(newSize)
  })

  closeModal()
}



const handleRemoveSize = (sizeId: string) => {
  if (confirm('¿Estás seguro de que quieres eliminar esta talla?')) {
    emit('remove', sizeId)
  }
}

const showColorSelectorModal = ref(false)
const selectedSizeForColors = ref<ProductSizeInventory | null>(null)

const openColorSelector = (sizeId: string) => {
  selectedSizeForColors.value = localSizes.value.find(s => s.id === sizeId) || null
  showColorSelectorModal.value = true
}

const closeColorSelector = () => {
  showColorSelectorModal.value = false
  selectedSizeForColors.value = null
}

const toggleColorForSize = (sizeId: string, colorId: string) => {
  const size = localSizes.value.find(s => s.id === sizeId)
  if (!size) return

  if (!size.colorIds) {
    size.colorIds = []
  }

  const index = size.colorIds.indexOf(colorId)
  if (index >= 0) {
    size.colorIds.splice(index, 1)
  } else {
    size.colorIds.push(colorId)
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Estadísticas -->
    <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="text-2xl font-bold text-gray-900">{{ stats.totalStock }}</div>
        <div class="text-sm text-gray-600">Stock Total</div>
      </div>
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="text-2xl font-bold text-gray-900">{{ stats.totalVariants }}</div>
        <div class="text-sm text-gray-600">Variantes</div>
      </div>
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="text-2xl font-bold text-gray-900">{{ stats.uniqueSizes.length }}</div>
        <div class="text-sm text-gray-600">Tallas Únicas</div>
      </div>
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="text-2xl font-bold text-gray-900">{{ stats.uniqueColors }}</div>
        <div class="text-sm text-gray-600">Colores</div>
      </div>
    </div>

    <div class="flex justify-between items-center">
      <h3 class="text-lg font-semibold text-gray-900">Gestión de Tallas e Inventario</h3>
      <button
        @click="openModal"
        type="button"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <span class="material-symbols-outlined text-lg">add</span>
        Agregar Talla
      </button>
    </div>

    <!-- Tabla de tallas -->
    <div class="overflow-x-auto bg-white rounded-lg border border-gray-200">
      <table v-if="localSizes.length > 0" class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Talla</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Colores</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Cantidad en Stock</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="size in localSizes" :key="size.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4">
              <span class="font-mono font-semibold text-gray-900">{{ size.size }}</span>
            </td>
            <td class="px-6 py-4">
              <div class="flex flex-wrap gap-2">
                <div
                  v-if="!size.colorIds || size.colorIds.length === 0"
                  class="text-sm text-gray-500"
                >
                  Sin colores
                </div>
                <button
                  v-for="colorId in size.colorIds"
                  :key="colorId"
                  @click="toggleColorForSize(size.id, colorId)"
                  class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white transition-opacity hover:opacity-75"
                  :style="{ backgroundColor: getColorHex(colorId) || '#e5e7eb' }"
                  :title="`Clic para quitar: ${getColorName(colorId)}`"
                >
                  <span class="w-3 h-3 rounded-full border border-white/50"></span>
                  {{ getColorName(colorId) }}
                </button>
                <button
                  @click="openColorSelector(size.id)"
                  type="button"
                  class="px-2 py-1 text-xs border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                  title="Agregar color"
                >
                  + Agregar
                </button>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-2 w-32">
                <button
                  @click.prevent="size.quantity = Math.max(0, size.quantity - 1)"
                  type="button"
                  class="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Disminuir"
                >
                  <span class="material-symbols-outlined text-lg">remove</span>
                </button>
                <input
                  v-model.number="size.quantity"
                  type="number"
                  min="0"
                  class="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                />
                <button
                  @click.prevent="size.quantity = size.quantity + 1"
                  type="button"
                  class="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Aumentar"
                >
                  <span class="material-symbols-outlined text-lg">add</span>
                </button>
              </div>
            </td>
            <td class="px-6 py-4">
              <button
                @click="handleRemoveSize(size.id)"
                class="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Eliminar"
              >
                <span class="material-symbols-outlined">delete</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="p-6 text-center text-gray-500">
        <p class="text-sm">No hay tallas agregadas. Haz clic en "Agregar Talla" para comenzar.</p>
      </div>
    </div>

    <!-- Modal para agregar tallas -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h4 class="text-lg font-semibold text-gray-900 mb-4">Agregar Tallas de Calzado</h4>

        <!-- Selector de Tallas Numéricas -->
        <div class="mb-6">
          <div class="flex justify-between items-center mb-3">
            <label class="block text-sm font-medium text-gray-700">Selecciona Tallas *</label>
            <div class="flex gap-2">
              <button
                @click="selectAllSizes"
                type="button"
                class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Seleccionar Todo
              </button>
              <button
                @click="clearAllSizes"
                type="button"
                class="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Limpiar
              </button>
            </div>
          </div>

          <!-- Grid de tallas numéricas (4 columnas) -->
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="size in NUMERIC_SIZES"
              :key="size"
              @click="toggleSize(size)"
              type="button"
              :class="[
                'p-3 rounded-lg font-bold border-2 transition-all',
                selectedSizes.includes(size)
                  ? 'border-blue-600 bg-blue-50 text-blue-900'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
              ]"
            >
              {{ size }}
            </button>
          </div>

          <p class="text-xs text-gray-500 mt-3">
            Seleccionadas: <span class="font-semibold">{{ selectedSizes.length }}</span> talla{{ selectedSizes.length !== 1 ? 's' : '' }}
          </p>
        </div>

        <!-- Selector de Color -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Color (Opcional)</label>
          <select
            v-model="modalForm.colorId"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Genérica (sin color)</option>
            <option v-for="color in colors" :key="color.id" :value="color.id">
              {{ color.name }}
            </option>
          </select>
        </div>

        <!-- Input de Cantidad -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Cantidad en Stock (para todas las tallas seleccionadas) *</label>
          <input
            v-model.number="modalForm.stock"
            type="number"
            min="0"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Botones -->
        <div class="flex gap-3">
          <button
            @click="closeModal"
            type="button"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="handleAddSizes"
            type="button"
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Agregar {{ selectedSizes.length > 0 ? selectedSizes.length : '' }} Talla{{ selectedSizes.length !== 1 ? 's' : '' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para seleccionar colores por talla -->
    <div v-if="showColorSelectorModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h4 class="text-lg font-semibold text-gray-900 mb-4">Seleccionar Colores - Talla {{ selectedSizeForColors?.size }}</h4>

        <!-- Lista de colores disponibles -->
        <div class="space-y-2 max-h-64 overflow-y-auto mb-6">
          <label
            v-for="color in colors"
            :key="color.id"
            class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              :checked="selectedSizeForColors?.colorIds?.includes(color.id) || false"
              @change="toggleColorForSize(selectedSizeForColors?.id || '', color.id)"
              class="w-4 h-4 rounded border-gray-300 text-blue-600"
            />
            <div
              class="w-6 h-6 rounded border-2 border-gray-300"
              :style="{ backgroundColor: color.hexCode }"
            ></div>
            <span class="text-sm font-medium text-gray-700">{{ color.name }}</span>
          </label>
        </div>

        <!-- Botón cerrar -->
        <button
          @click="closeColorSelector"
          type="button"
          class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Listo
        </button>
      </div>
    </div>
  </div>
</template>
