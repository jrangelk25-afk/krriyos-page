<template>
  <div class="space-y-8">
    <!-- Step 1: Size Selection -->
    <div class="space-y-4">
      <div class="flex items-center gap-2">
        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-on-primary font-bold text-sm">
          1
        </div>
        <label class="font-label-lg text-label-lg text-on-surface uppercase">
          Selecciona una Talla
        </label>
      </div>
      
      <div class="flex gap-3 flex-wrap">
        <button
          v-for="s in uniqueSizes"
          :key="s"
          @click="selectedSize = s"
          :disabled="!getSizesAvailable().includes(s)"
          :class="[
            'px-6 py-3 rounded-lg font-label-md text-label-md uppercase transition-all duration-200',
            selectedSize === s
              ? 'bg-primary text-on-primary shadow-lg ring-2 ring-primary ring-offset-2'
              : getSizesAvailable().includes(s)
              ? 'bg-surface-variant text-on-surface-variant border border-outline hover:bg-primary hover:text-on-primary hover:border-primary'
              : 'bg-surface-dim text-on-surface-variant cursor-not-allowed opacity-50 border border-outline'
          ]"
        >
          {{ s }}
        </button>
      </div>
    </div>

    <!-- Step 2: Color Selection (based on selected size) -->
    <div v-if="selectedSize" class="space-y-4 animate-in fade-in">
      <div class="flex items-center gap-2">
        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-on-primary font-bold text-sm">
          2
        </div>
        <label class="font-label-lg text-label-lg text-on-surface uppercase">
          Selecciona un Color para talla {{ selectedSize }}
        </label>
      </div>
      
      <div v-if="colorsBySize.length === 0" class="text-on-surface-variant py-6 text-center">
        <p class="font-body-md">No hay colores disponibles para esta talla</p>
      </div>

      <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          v-for="color in colorsBySize"
          :key="color.id"
          @click="selectedColor = color"
          :disabled="color.stock === 0"
          :class="[
            'group relative overflow-hidden rounded-lg border-2 transition-all duration-200 p-4 flex flex-col items-center gap-3',
            selectedColor?.id === color.id
              ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2'
              : color.stock === 0
              ? 'border-outline opacity-40 cursor-not-allowed'
              : 'border-outline hover:border-primary hover:bg-surface-bright'
          ]"
        >
          <!-- Color preview circle -->
          <div
            class="w-16 h-16 rounded-full border-4 border-outline shadow-md transition-transform group-hover:scale-110"
            :style="{ backgroundColor: color.hexCode || '#CCCCCC' }"
            :title="`${color.name} (${color.hexCode})`"
          />
          
          <!-- Color name and stock -->
          <div class="text-center w-full">
            <div class="font-label-md text-label-md text-on-surface uppercase">{{ color.name }}</div>
            <div
              :class="[
                'text-label-sm text-label-sm mt-2 uppercase',
                color.stock > 0 ? 'text-success' : 'text-error'
              ]"
            >
              {{ color.stock > 0 ? `${color.stock} disponibles` : 'AGOTADO' }}
            </div>
          </div>

          <!-- Selection indicator -->
          <div v-if="selectedColor?.id === color.id" class="absolute top-2 right-2">
            <div class="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-on-primary">
              <span class="material-symbols-outlined text-sm">check</span>
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- Step 3: Quantity Selection -->
    <div v-if="selectedColor && selectedSize" class="space-y-4 animate-in fade-in">
      <div class="flex items-center gap-2">
        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-on-primary font-bold text-sm">
          3
        </div>
        <label class="font-label-lg text-label-lg text-on-surface uppercase">
          Cantidad
        </label>
      </div>
      
      <div class="flex items-center gap-4 bg-surface-bright rounded-lg p-4 border border-outline">
        <button
          @click="quantity = Math.max(1, quantity - 1)"
          :disabled="quantity === 1"
          class="flex items-center justify-center w-10 h-10 rounded-lg border border-outline hover:bg-surface-variant disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span class="material-symbols-outlined text-xl">remove</span>
        </button>
        
        <input
          v-model.number="quantity"
          type="number"
          min="1"
          :max="selectedColor.stock"
          class="flex-1 px-4 py-2 border border-outline rounded-lg text-center font-label-lg text-label-lg"
        />
        
        <button
          @click="quantity = Math.min(selectedColor.stock, quantity + 1)"
          :disabled="quantity === selectedColor.stock"
          class="flex items-center justify-center w-10 h-10 rounded-lg border border-outline hover:bg-surface-variant disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span class="material-symbols-outlined text-xl">add</span>
        </button>
        
        <span class="font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">
          Máx: {{ selectedColor.stock }}
        </span>
      </div>
    </div>

    <!-- Summary Card -->
    <div v-if="selectedSize && selectedColor" class="bg-surface-bright border-2 border-primary rounded-lg p-6 animate-in fade-in">
      <div class="space-y-4">
        <p class="font-label-md text-label-md text-on-surface-variant uppercase">Resumen del Pedido</p>
        
        <div class="flex items-center gap-4">
          <!-- Color preview -->
          <div class="flex-shrink-0">
            <div
              class="w-20 h-20 rounded-lg border-3 border-primary shadow-md"
              :style="{ backgroundColor: selectedColor.hexCode }"
            />
          </div>
          
          <!-- Details -->
          <div class="flex-1 space-y-2">
            <div class="font-headline-sm text-headline-sm text-on-surface">
              {{ quantity }}x {{ productName }}
            </div>
            <div class="space-y-1 text-on-surface-variant">
              <p class="font-body-md">Talla: <span class="font-label-lg text-label-lg text-primary uppercase">{{ selectedSize }}</span></p>
              <p class="font-body-md">Color: <span class="font-label-lg text-label-lg text-primary">{{ selectedColor.name }}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Button -->
    <button
      @click="handleAddToCart"
      :disabled="!selectedSize || !selectedColor"
      :class="[
        'w-full py-4 rounded-lg font-label-lg text-label-lg uppercase transition-all duration-200 flex items-center justify-center gap-2',
        selectedSize && selectedColor
          ? 'bg-primary text-on-primary hover:shadow-lg active:scale-95'
          : 'bg-surface-variant text-on-surface-variant cursor-not-allowed'
      ]"
    >
      <span v-if="selectedSize && selectedColor" class="material-symbols-outlined">shopping_cart</span>
      <span v-if="!selectedSize || !selectedColor">
        Completa tu selección
      </span>
      <span v-else>
        Agregar al Carrito
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';

interface Color {
  id: string;
  name: string;
  hexCode: string;
  stock: number;
  isAvailable: boolean;
}

interface Props {
  productId: string;
  productName: string;
}

const props = withDefaults(defineProps<Props>(), {});

const emit = defineEmits<{
  addToCart: [details: { size: string; colorId: string; colorName: string; quantity: number }];
}>();

const selectedSize = ref<string | null>(null);
const selectedColor = ref<Color | null>(null);
const quantity = ref(1);
const colorsBySize = ref<Color[]>([]);
const allSizes = ref<string[]>([]);
const productData = ref<any>(null);

// Standard size order
const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

const uniqueSizes = computed(() => {
  return allSizes.value.sort((a, b) => {
    const indexA = sizeOrder.indexOf(a);
    const indexB = sizeOrder.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });
});

function getSizesAvailable(): string[] {
  // Return sizes that have at least one color with stock > 0
  if (!productData.value?.sizes) return [];
  
  const sizesWithStock = new Set(
    productData.value.sizes
      .filter((s: any) => s.stock > 0)
      .map((s: any) => s.size)
  );
  
  return Array.from(sizesWithStock) as string[];
}

async function fetchColorsBySize() {
  if (!selectedSize.value || !productData.value) return;

  try {
    // Get colors available for the selected size from product data
    const colorsForSize = new Map<string, Color>();
    
    productData.value.sizes.forEach((size: any) => {
      if (size.size === selectedSize.value) {
        const color: Color = {
          id: size.colorId,
          name: size.colorName || 'Sin nombre',
          hexCode: size.hexCode || '#CCCCCC',
          stock: size.quantity || 0,
          isAvailable: size.quantity > 0
        };
        
        if (!colorsForSize.has(color.id)) {
          colorsForSize.set(color.id, color);
        }
      }
    });

    colorsBySize.value = Array.from(colorsForSize.values());
    selectedColor.value = null;
    quantity.value = 1;
  } catch (error) {
    console.error('Error fetching colors by size:', error);
    colorsBySize.value = [];
  }
}

async function initializeInventory() {
  try {
    // Fetch the product data
    const response = await fetch(`/api/public/products/${props.productId}`);
    if (!response.ok) return;

    const result = await response.json();
    productData.value = result.data || result;
    
    // Extract unique sizes
    if (productData.value.sizes) {
      allSizes.value = [...new Set(productData.value.sizes.map((s: any) => s.size))] as string[];
    }
  } catch (error) {
    console.error('Error initializing inventory:', error);
  }
}

function handleAddToCart() {
  if (!selectedSize.value || !selectedColor.value) return;

  emit('addToCart', {
    size: selectedSize.value,
    colorId: selectedColor.value.id,
    colorName: selectedColor.value.name,
    quantity: quantity.value
  });

  // Reset for next selection
  selectedSize.value = null;
  selectedColor.value = null;
  quantity.value = 1;
}

watch(() => selectedSize.value, () => {
  fetchColorsBySize();
});

onMounted(() => {
  initializeInventory();
});
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-in {
  animation: fadeIn 0.2s ease-out;
}

.fade-in {
  animation: fadeIn 0.2s ease-out;
}
</style>
