<script setup lang="ts">
interface Props {
  selectedCategory?: string | null
  sortBy?: string
}

withDefaults(defineProps<Props>(), {
  selectedCategory: null,
  sortBy: 'nombre',
})

const emit = defineEmits<{
  'update:selectedCategory': [value: string | null]
  'update:sortBy': [value: string]
}>()

const categories = [
  { id: 'sneakers', name: 'Sneakers' },
  { id: 'urban', name: 'Urban' },
  { id: 'botas', name: 'Botas' },
]

const sortOptions = [
  { value: 'nombre', label: 'Nombre' },
  { value: 'precio-asc', label: 'Precio: Menor a Mayor' },
  { value: 'precio-desc', label: 'Precio: Mayor a Menor' },
  { value: 'nuevo', label: 'Más Nuevos' },
]
</script>

<template>
  <aside class="w-full lg:w-64 pr-0 lg:pr-8 mb-8 lg:mb-0">
    <!-- Categorías -->
    <div class="mb-8 pb-8 border-b border-outline-variant">
      <h3 class="font-headline-sm text-headline-sm uppercase mb-4 text-on-surface">Categorías</h3>
      <div class="space-y-2">
        <label class="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
          <input 
            type="radio" 
            :checked="selectedCategory === null"
            @change="emit('update:selectedCategory', null)"
            class="w-4 h-4 cursor-pointer"
          />
          <span class="font-body-md text-body-md">Todas</span>
        </label>
        <label 
          v-for="cat in categories"
          :key="cat.id"
          class="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
        >
          <input 
            type="radio" 
            :checked="selectedCategory === cat.id"
            @change="emit('update:selectedCategory', cat.id)"
            class="w-4 h-4 cursor-pointer"
          />
          <span class="font-body-md text-body-md">{{ cat.name }}</span>
        </label>
      </div>
    </div>

    <!-- Ordenamiento -->
    <div class="mb-8">
      <h3 class="font-headline-sm text-headline-sm uppercase mb-4 text-on-surface">Ordenar por</h3>
      <select 
        :value="sortBy"
        @change="(e) => emit('update:sortBy', (e.target as HTMLSelectElement).value)"
        class="w-full px-3 py-2 border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:border-primary transition-colors duration-300"
      >
        <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>
  </aside>
</template>
