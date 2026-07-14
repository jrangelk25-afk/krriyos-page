import { useProductStore } from '../stores/productStore'

export const useProducts = () => {
  const productStore = useProductStore()

  const getAll = () => {
    return productStore.allProducts
  }

  const getById = (productId: string) => {
    return productStore.getProductById(productId)
  }

  const filterByCategory = (category: string) => {
    productStore.filterByCategory(category)
    return productStore.filteredProducts
  }

  const sortBy = (criteria: string) => {
    productStore.sortProducts(criteria)
    return productStore.filteredProducts
  }

  const search = (query: string) => {
    productStore.searchProducts(query)
    return productStore.filteredProducts
  }

  const getNewArrivals = () => {
    return productStore.newArrivals
  }

  const getOutletProducts = () => {
    return productStore.outletProducts
  }

  const applyFilter = (filters: any) => {
    productStore.applyFilter(filters)
    return productStore.filteredProducts
  }

  const clearFilters = () => {
    productStore.clearFilters()
    return productStore.allProducts
  }

  const initializeData = async () => {
    await productStore.loadCategories()
    await productStore.loadProducts()
  }

  return {
    getAll,
    getById,
    filterByCategory,
    sortBy,
    search,
    getNewArrivals,
    getOutletProducts,
    clearFilters,
    applyFilter,
    initializeData,
    loadCategories: productStore.loadCategories,
    loadProducts: productStore.loadProducts,
    loadProductById: productStore.loadProductById,
    // Retornar referencias DIRECTAS a la store con getters
    get filteredProducts() {
      return productStore.filteredProducts
    },
    get allProducts() {
      return productStore.allProducts
    },
    get categories() {
      return productStore.categories
    },
    get filters() {
      return productStore.filters
    },
    get isLoading() {
      return productStore.isLoading
    },
    get error() {
      return productStore.error
    },
  }
}
