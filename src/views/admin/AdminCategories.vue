<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AdminLayout from '../../components/admin/AdminLayout.vue'
import { fetchCategories, deleteCategory, createCategory, updateCategory } from '../../lib/adminApi'

interface Category {
  id: string
  name: string
  slug: string
  displayOrder: number
  isActive: boolean
}

const categories = ref<Category[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const formData = ref({
  name: '',
  description: '',
  slug: '',
  displayOrder: 0,
  isActive: true,
})
const formError = ref<string | null>(null)

const fetchData = async () => {
  try {
    loading.value = true
    categories.value = await fetchCategories()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error fetching categories'
  } finally {
    loading.value = false
  }
}

const openModal = (category?: Category) => {
  if (category) {
    isEditing.value = true
    editingId.value = category.id
    formData.value = { 
      ...category,
      description: (category as any).description || ''
    }
  } else {
    isEditing.value = false
    editingId.value = null
    formData.value = {
      name: '',
      description: '',
      slug: '',
      displayOrder: 0,
      isActive: true,
    }
  }
  formError.value = null
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  formError.value = null
}

const handleSubmit = async () => {
  try {
    formError.value = null
    if (!formData.value.name.trim()) {
      formError.value = 'El nombre es requerido'
      return
    }
    if (!formData.value.slug.trim()) {
      formError.value = 'El slug es requerido'
      return
    }

    if (isEditing.value && editingId.value) {
      const updated = await updateCategory(editingId.value, formData.value)
      const index = categories.value.findIndex(c => c.id === editingId.value)
      if (index !== -1) {
        categories.value[index] = updated
      }
    } else {
      const created = await createCategory(formData.value)
      categories.value.push(created)
    }
    closeModal()
  } catch (err) {
    formError.value = err instanceof Error ? err.message : 'Error saving category'
  }
}

const handleDelete = async (id: string) => {
  if (confirm('¿Estás seguro?')) {
    try {
      await deleteCategory(id)
      categories.value = categories.value.filter(c => c.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error deleting category'
    }
  }
}

// Generate slug from name
const updateSlug = () => {
  formData.value.slug = formData.value.name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
}

onMounted(fetchData)
</script>

<template>
  <AdminLayout>
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900">Categorías</h1>
        <button
          @click="openModal()"
          class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span class="material-symbols-outlined">add</span>
          Nueva Categoría
        </button>
      </div>

      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="text-gray-500">Cargando...</div>
      </div>

      <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nombre</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Slug</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Orden</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Estado</th>
              <th class="px-6 py-3 text-right text-sm font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="category in categories" :key="category.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ category.name }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ category.slug }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ category.displayOrder }}</td>
              <td class="px-6 py-4 text-sm">
                <span :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                ]">
                  {{ category.isActive ? 'Activa' : 'Inactiva' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-right space-x-2">
                <button
                  @click="openModal(category)"
                  class="text-blue-600 hover:text-blue-800 transition-colors"
                  title="Editar"
                >
                  <span class="material-symbols-outlined">edit</span>
                </button>
                <button
                  @click="handleDelete(category.id)"
                  class="text-red-600 hover:text-red-800 transition-colors"
                  title="Eliminar"
                >
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal -->
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div class="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <h2 class="text-2xl font-bold text-white">
              {{ isEditing ? 'Editar Categoría' : 'Nueva Categoría' }}
            </h2>
          </div>

          <div class="px-8 py-6 max-h-96 overflow-y-auto">
            <div v-if="formError" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p class="text-red-800 text-sm">{{ formError }}</p>
            </div>

            <form @submit.prevent="handleSubmit" class="space-y-5">
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">Nombre *</label>
                <input
                  v-model="formData.name"
                  @change="updateSlug"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Zapatos casuales"
                  required
                />
                <p class="text-xs text-gray-500 mt-1">Nombre único de la categoría</p>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">Descripción</label>
                <textarea
                  v-model="formData.description"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descripción breve de la categoría"
                  rows="3"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">Slug *</label>
                <input
                  v-model="formData.slug"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="ej-zapatos-casuales"
                  required
                />
                <p class="text-xs text-gray-500 mt-1">URL-friendly, se genera automáticamente</p>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">Orden de Visualización</label>
                <input
                  v-model.number="formData.displayOrder"
                  type="number"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
                <p class="text-xs text-gray-500 mt-1">Número menor aparece primero</p>
              </div>

              <div class="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                <input
                  v-model="formData.isActive"
                  type="checkbox"
                  id="isActive"
                  class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <label for="isActive" class="text-sm font-medium text-gray-700 cursor-pointer">
                  Categoría activa
                </label>
              </div>

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
                  class="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {{ isEditing ? 'Actualizar' : 'Crear' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
