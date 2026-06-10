<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useValidation } from '../composables/useValidation'

const emit = defineEmits<{
  submit: [data: any]
}>()

const validation = useValidation()
const isLoading = ref(false)

const formData = reactive({
  nombre: '',
  email: '',
  telefono: '',
  direccion: '',
  ciudad: '',
  pais: 'Colombia',
})

const errors = reactive<Record<string, string | null>>({
  nombre: null,
  email: null,
  telefono: null,
  direccion: null,
  ciudad: null,
  pais: null,
})

const validationSchema = {
  nombre: { required: true, minLength: 3 },
  email: { required: true, email: true },
  telefono: { required: true, phone: true },
  direccion: { required: true, minLength: 5 },
  ciudad: { required: true, minLength: 2 },
  pais: { required: true },
}

const validateField = (field: keyof typeof formData) => {
  const rules = validationSchema[field]
  const value = formData[field]
  errors[field] = validation.validateField(value, rules)
}

const isFormValid = computed(() => {
  return Object.values(errors).every(error => error === null)
})

const handleSubmit = async () => {
  // Validate all fields
  Object.keys(formData).forEach((field) => {
    validateField(field as keyof typeof formData)
  })

  if (!isFormValid.value) {
    return
  }

  isLoading.value = true
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    emit('submit', { ...formData })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="w-full">
    <h2 class="font-headline-lg text-headline-md md:text-headline-lg uppercase text-on-surface mb-8">
      Información de Comprador
    </h2>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Nombre -->
      <div>
        <label class="block font-label-caps text-label-caps text-on-surface uppercase mb-2">
          Nombre Completo
        </label>
        <input 
          v-model="formData.nombre"
          @blur="() => validateField('nombre')"
          @input="() => validateField('nombre')"
          type="text"
          class="w-full px-4 py-3 border border-outline-variant rounded-lg font-body-md focus:outline-none focus:border-primary transition-colors"
          placeholder="Tu nombre completo"
        />
        <p v-if="errors.nombre" class="text-error text-sm mt-1">{{ errors.nombre }}</p>
      </div>

      <!-- Email -->
      <div>
        <label class="block font-label-caps text-label-caps text-on-surface uppercase mb-2">
          Correo Electrónico
        </label>
        <input 
          v-model="formData.email"
          @blur="() => validateField('email')"
          @input="() => validateField('email')"
          type="email"
          class="w-full px-4 py-3 border border-outline-variant rounded-lg font-body-md focus:outline-none focus:border-primary transition-colors"
          placeholder="tu@correo.com"
        />
        <p v-if="errors.email" class="text-error text-sm mt-1">{{ errors.email }}</p>
      </div>

      <!-- Teléfono -->
      <div>
        <label class="block font-label-caps text-label-caps text-on-surface uppercase mb-2">
          Teléfono
        </label>
        <input 
          v-model="formData.telefono"
          @blur="() => validateField('telefono')"
          @input="() => validateField('telefono')"
          type="tel"
          class="w-full px-4 py-3 border border-outline-variant rounded-lg font-body-md focus:outline-none focus:border-primary transition-colors"
          placeholder="+57 3001234567"
        />
        <p v-if="errors.telefono" class="text-error text-sm mt-1">{{ errors.telefono }}</p>
      </div>

      <!-- Dirección -->
      <div>
        <label class="block font-label-caps text-label-caps text-on-surface uppercase mb-2">
          Dirección de Envío
        </label>
        <input 
          v-model="formData.direccion"
          @blur="() => validateField('direccion')"
          @input="() => validateField('direccion')"
          type="text"
          class="w-full px-4 py-3 border border-outline-variant rounded-lg font-body-md focus:outline-none focus:border-primary transition-colors"
          placeholder="Calle 123, Apto 456"
        />
        <p v-if="errors.direccion" class="text-error text-sm mt-1">{{ errors.direccion }}</p>
      </div>

      <!-- Ciudad -->
      <div>
        <label class="block font-label-caps text-label-caps text-on-surface uppercase mb-2">
          Ciudad
        </label>
        <input 
          v-model="formData.ciudad"
          @blur="() => validateField('ciudad')"
          @input="() => validateField('ciudad')"
          type="text"
          class="w-full px-4 py-3 border border-outline-variant rounded-lg font-body-md focus:outline-none focus:border-primary transition-colors"
          placeholder="Bogotá"
        />
        <p v-if="errors.ciudad" class="text-error text-sm mt-1">{{ errors.ciudad }}</p>
      </div>

      <!-- País -->
      <div>
        <label class="block font-label-caps text-label-caps text-on-surface uppercase mb-2">
          País
        </label>
        <select 
          v-model="formData.pais"
          @change="() => validateField('pais')"
          class="w-full px-4 py-3 border border-outline-variant rounded-lg font-body-md focus:outline-none focus:border-primary transition-colors"
        >
          <option value="Colombia">Colombia</option>
          <option value="Ecuador">Ecuador</option>
          <option value="Peru">Perú</option>
          <option value="Venezuela">Venezuela</option>
          <option value="Argentina">Argentina</option>
        </select>
        <p v-if="errors.pais" class="text-error text-sm mt-1">{{ errors.pais }}</p>
      </div>

      <!-- Submit Button -->
      <button 
        type="submit"
        :disabled="!isFormValid || isLoading"
        class="w-full bg-primary text-on-primary px-8 py-4 font-label-caps text-label-caps uppercase hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <span v-if="isLoading" class="material-symbols-outlined animate-spin">loading</span>
        {{ isLoading ? 'Procesando...' : 'Confirmar Compra' }}
      </button>
    </form>
  </div>
</template>
