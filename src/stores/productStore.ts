import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product, ProductFilters } from '../types'

export const useProductStore = defineStore('products', () => {
  const allProducts = ref<Product[]>([])
  const categories = ref<any[]>([])
  const filters = ref<ProductFilters>({})
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Función para cargar categorías desde la BD
  const loadCategories = async () => {
    try {
      isLoading.value = true
      const response = await fetch('/api/public/categories')
      const result = await response.json()

      if (result.success) {
        categories.value = result.data
      } else {
        throw new Error(result.error || 'Failed to load categories')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error loading categories'
      console.error('Error loading categories:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Función para cargar productos desde la BD
  const loadProducts = async (categoryId?: string, isOutlet?: boolean, isNew?: boolean) => {
    try {
      isLoading.value = true
      let url = '/api/public/products'
      const params = []

      if (categoryId) {
        params.push(`categoryId=${categoryId}`)
      }
      if (isOutlet) {
        params.push('isOutlet=true')
      }
      if (isNew) {
        params.push('isNew=true')
      }

      if (params.length > 0) {
        url += '?' + params.join('&')
      }

      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        allProducts.value = result.data.map((product: any) => {
          // Debug logging
          if (!product.categoryId) {
            console.warn('⚠️ Producto sin categoryId:', {
              id: product.id,
              name: product.name,
              category: product.category?.name,
              categoryId: product.categoryId,
            })
          }
          return {
            id: product.id,
            sku: product.sku,
            nombre: product.name,
            descripcion: product.description,
            precio: parseFloat(product.price),
            imagenes: product.images
              ?.sort((a: any, b: any) => a.displayOrder - b.displayOrder)
              ?.map((img: any) => img.imageUrl) || [],
            categoria: product.category?.name || '',
            categoryId: product.categoryId,
            tallas: [...new Set(product.sizes?.map((s: any) => s.size) || [])],
            sizes: product.sizes?.map((s: any) => ({
              id: s.id,
              size: s.size,
              stock: s.stock,
              colorId: s.colorId,
              colorName: s.color?.name,
              quantity: s.stock,
              availableColors: s.availableColors || [], // ✅ NUEVO
            })) || [],
            stock: product.stock,
            isNewArrival: product.isNewArrival,
            isOutlet: product.isOutlet,
            colors: product.colors || [],
            allImages: product.images?.sort((a: any, b: any) => a.displayOrder - b.displayOrder) || [],
          }
        })
      } else {
        throw new Error(result.error || 'Failed to load products')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error loading products'
      console.error('Error loading products:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Función para cargar un producto individual
  const loadProductById = async (id: string) => {
    try {
      const response = await fetch(`/api/public/products/${id}`)
      const result = await response.json()

      if (result.success) {
        return {
          id: result.data.id,
          sku: result.data.sku,
          nombre: result.data.name,
          descripcion: result.data.description,
          precio: parseFloat(result.data.price),
          imagenes: result.data.images
            ?.sort((a: any, b: any) => a.displayOrder - b.displayOrder)
            ?.map((img: any) => img.imageUrl) || [],
          categoria: result.data.category?.name || '',
          tallas: [...new Set(result.data.sizes?.map((s: any) => s.size) || [])],
          sizes: result.data.sizes?.map((s: any) => ({
            id: s.id,
            size: s.size,
            stock: s.stock,
            colorId: s.colorId,
            colorName: s.color?.name,
            quantity: s.stock,
            availableColors: s.availableColors || [], // ✅ NUEVO
          })) || [],
          stock: result.data.stock,
          isNewArrival: result.data.isNewArrival,
          isOutlet: result.data.isOutlet,
          categoryId: result.data.categoryId,
          colors: result.data.colors || [],
          allImages: result.data.images?.sort((a: any, b: any) => a.displayOrder - b.displayOrder) || [],
        }
      } else {
        throw new Error(result.error || 'Failed to load product')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error loading product'
      console.error('Error loading product:', err)
      return null
    }
  }

  const filteredProducts = computed(() => {
    let result = [...allProducts.value]

    // Filtrar por categoryId
    if (filters.value.categoryId) {
      const filterId = String(filters.value.categoryId).trim()
      result = result.filter((p) => String(p.categoryId).trim() === filterId)
    }

    // Filtrar outlet
    if ((filters.value as any).isOutlet) {
      result = result.filter((p) => p.isOutlet)
    }

    // Filtrar nuevos
    if ((filters.value as any).isNew) {
      result = result.filter((p) => p.isNewArrival)
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

  const outletProducts = computed(() => {
    return allProducts.value
      .filter((p) => p.isOutlet)
      .slice(0, 8)
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

  const filterByCategory = (categoryId: string) => {
    applyFilter({ categoryId: categoryId })
  }

  return {
    allProducts,
    categories,
    filters,
    filteredProducts,
    newArrivals,
    outletProducts,
    productsByCategory,
    applyFilter,
    clearFilters,
    getProductById,
    sortProducts,
    searchProducts,
    filterByCategory,
    loadCategories,
    loadProducts,
    loadProductById,
    isLoading,
    error,
  }
})
