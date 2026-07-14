<script setup lang="ts">
import { ref, computed } from 'vue'
import { uploadImage } from '../../services/supabaseStorage'

interface ProductImageData {
  id: string
  imageUrl: string
  displayOrder: number
  isPrimary: boolean
}

interface Props {
  images: ProductImageData[]
  loading?: boolean
}

interface Emits {
  (e: 'update', images: ProductImageData[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const imageInput = ref<HTMLInputElement>()
const draggedIndex = ref<number | null>(null)
const uploading = ref(false)
const uploadError = ref<string | null>(null)

const sortedImages = computed(() => {
  return [...props.images].sort((a, b) => a.displayOrder - b.displayOrder)
})

const handleImageSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    uploadError.value = 'Por favor selecciona una imagen válida'
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    uploadError.value = 'La imagen no debe superar 5MB'
    return
  }

  try {
    uploading.value = true
    uploadError.value = null

    const uploadedUrl = await uploadImage(file, 'products')
    if (!uploadedUrl) {
      uploadError.value = 'Error al subir la imagen'
      return
    }

    const newImage: ProductImageData = {
      id: `new-${Date.now()}`,
      imageUrl: uploadedUrl,
      displayOrder: props.images.length,
      isPrimary: props.images.length === 0,
    }

    const updatedImages = [...props.images, newImage]
    emit('update', updatedImages)

    // Reset input
    ;(event.target as HTMLInputElement).value = ''
  } catch (err) {
    uploadError.value = err instanceof Error ? err.message : 'Error al subir la imagen'
  } finally {
    uploading.value = false
  }
}

const removeImage = async (index: number) => {
  try {
    const updatedImages = props.images.filter((_, i) => i !== index)

    // Reordenar display order
    updatedImages.forEach((img, i) => {
      img.displayOrder = i
      if (i === 0) img.isPrimary = true
      else img.isPrimary = false
    })

    emit('update', updatedImages)
  } catch (err) {
    uploadError.value = err instanceof Error ? err.message : 'Error al remover imagen'
  }
}

const handleDragStart = (index: number) => {
  draggedIndex.value = index
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  event.dataTransfer!.dropEffect = 'move'
}

const handleDrop = (event: DragEvent, targetIndex: number) => {
  event.preventDefault()
  if (draggedIndex.value === null || draggedIndex.value === targetIndex) return

  const newImages = [...props.images]
  const draggedImage = newImages[draggedIndex.value]

  // Remover la imagen del índice original
  newImages.splice(draggedIndex.value, 1)
  // Insertar en el nuevo índice
  newImages.splice(targetIndex, 0, draggedImage)

  // Actualizar displayOrder y isPrimary
  newImages.forEach((img, i) => {
    img.displayOrder = i
    img.isPrimary = i === 0
  })

  draggedIndex.value = null
  emit('update', newImages)
}

const handleDragEnd = () => {
  draggedIndex.value = null
}

const setPrimary = (index: number) => {
  const newImages = [...props.images]
  newImages.forEach((img, i) => {
    img.isPrimary = i === index
  })
  emit('update', newImages)
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-semibold text-gray-900">Imágenes del Producto</h3>
      <span class="text-sm text-gray-500">{{ images.length }} imagen(s)</span>
    </div>

    <div v-if="uploadError" class="bg-red-50 border border-red-200 rounded-lg p-3">
      <p class="text-red-800 text-sm">{{ uploadError }}</p>
    </div>

    <!-- Upload Area -->
    <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors cursor-pointer"
      @click="imageInput?.click()">
      <input
        ref="imageInput"
        type="file"
        accept="image/*"
        @change="handleImageSelect"
        class="hidden"
        :disabled="uploading"
      />
      <div class="text-center">
        <span class="material-symbols-outlined text-4xl text-gray-400 block mb-2">cloud_upload</span>
        <p class="text-sm font-medium text-gray-700">
          {{ uploading ? 'Subiendo...' : 'Click para subir o arrastra imágenes' }}
        </p>
        <p class="text-xs text-gray-500 mt-1">JPG, PNG, WebP. Máximo 5MB</p>
      </div>
    </div>

    <!-- Images Gallery -->
    <div v-if="images.length > 0" class="space-y-4">
      <div class="flex gap-3 overflow-x-auto pb-2">
        <div
          v-for="(image, index) in sortedImages"
          :key="image.id"
          draggable="true"
          @dragstart="handleDragStart(props.images.indexOf(image))"
          @dragover="handleDragOver"
          @drop="handleDrop($event, props.images.indexOf(image))"
          @dragend="handleDragEnd"
          :class="[
            'flex-shrink-0 relative group cursor-move rounded-lg overflow-hidden border-2 transition-all',
            image.isPrimary ? 'border-blue-500 w-32 h-32' : 'border-gray-300 w-28 h-28 hover:border-blue-400',
            draggedIndex === props.images.indexOf(image) ? 'opacity-50' : '',
          ]"
        >
          <img
            :src="image.imageUrl"
            :alt="`Product image ${index + 1}`"
            class="w-full h-full object-cover"
          />

          <!-- Primary Badge -->
          <div v-if="image.isPrimary" class="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
            Principal
          </div>

          <!-- Hover Actions -->
          <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              v-if="!image.isPrimary"
              @click.stop="setPrimary(props.images.indexOf(image))"
              class="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
              title="Establecer como principal"
            >
              <span class="material-symbols-outlined text-sm">star</span>
            </button>
            <button
              @click.stop="removeImage(props.images.indexOf(image))"
              class="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
              title="Eliminar imagen"
            >
              <span class="material-symbols-outlined text-sm">delete</span>
            </button>
          </div>

          <!-- Drag Indicator -->
          <div class="absolute bottom-1 right-1 bg-gray-800/75 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            <span class="material-symbols-outlined text-sm">drag_handle</span>
          </div>
        </div>
      </div>

      <p class="text-xs text-gray-500">
        Arrastra las imágenes para reordenarlas. La primera imagen es la principal.
      </p>
    </div>

    <div v-else class="text-center py-8 text-gray-500">
      <p class="text-sm">No hay imágenes. Sube la primera imagen arriba.</p>
    </div>
  </div>
</template>

<style scoped>
/* Smooth transitions */
.group {
  @apply transition-all duration-200;
}
</style>
