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
    productStore.applyFilter({ categoria: category })
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

  const clearFilters = () => {
    productStore.clearFilters()
    return productStore.allProducts
  }

  return {
    getAll,
    getById,
    filterByCategory,
    sortBy,
    search,
    getNewArrivals,
    clearFilters,
    filteredProducts: productStore.filteredProducts,
    allProducts: productStore.allProducts,
    categories: productStore.categories,
  }
}
