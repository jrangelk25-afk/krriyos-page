import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { PRODUCTS, CATEGORIES } from '../data/products'
import type { Product, ProductFilters } from '../types'

export const useProductStore = defineStore('products', () => {
  const allProducts = ref<Product[]>(PRODUCTS)
  const categories = ref(CATEGORIES)
  const filters = ref<ProductFilters>({})

  const filteredProducts = computed(() => {
    let result = [...allProducts.value]

    // Filtrar por categoría
    if (filters.value.categoria) {
      result = result.filter((p) => p.categoria === filters.value.categoria)
    }

    // Buscar por nombre o SKU
    if (filters.value.searchQuery) {
      const query = filters.value.searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.nombre.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query)
      )
    }

    // Ordenar
    if (filters.value.sortBy === 'precio-asc') {
      result.sort((a, b) => a.precio - b.precio)
    } else if (filters.value.sortBy === 'precio-desc') {
      result.sort((a, b) => b.precio - a.precio)
    } else if (filters.value.sortBy === 'nombre') {
      result.sort((a, b) => a.nombre.localeCompare(b.nombre))
    } else if (filters.value.sortBy === 'nuevo') {
      result.sort((a, b) => {
        if (a.isNewArrival === b.isNewArrival) return 0
        return a.isNewArrival ? -1 : 1
      })
    }

    return result
  })

  const newArrivals = computed(() => {
    return allProducts.value
      .filter((p) => p.isNewArrival)
      .slice(0, 4)
  })

  const productsByCategory = computed(() => {
    return (category: string) => {
      return allProducts.value.filter((p) => p.categoria === category)
    }
  })

  // Actions
  const applyFilter = (newFilters: ProductFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {}
  }

  const getProductById = (id: string): Product | undefined => {
    return allProducts.value.find((p) => p.id === id)
  }

  const sortProducts = (sortBy: string) => {
    applyFilter({ sortBy: sortBy as any })
  }

  const searchProducts = (query: string) => {
    applyFilter({ searchQuery: query })
  }

  return {
    allProducts,
    categories,
    filters,
    filteredProducts,
    newArrivals,
    productsByCategory,
    applyFilter,
    clearFilters,
    getProductById,
    sortProducts,
    searchProducts,
  }
})
