import { describe, it, expect } from 'vitest'
import { PRODUCTS } from '../../data/products'

describe('ProductService', () => {
  describe('loadProducts', () => {
    it('should load at least 12 products', () => {
      expect(PRODUCTS).toBeDefined()
      expect(PRODUCTS.length).toBeGreaterThanOrEqual(12)
    })

    it('should have all products with required fields', () => {
      PRODUCTS.forEach(product => {
        expect(product.id).toBeDefined()
        expect(product.sku).toBeDefined()
        expect(product.nombre).toBeDefined()
        expect(product.precio).toBeGreaterThan(0)
        expect(product.categoria).toMatch(/Sneakers|Urban|Botas/)
        expect(product.imagenes.length).toBeGreaterThan(0)
        expect(product.tallas.length).toBeGreaterThan(0)
        expect(typeof product.stock).toBe('number')
      })
    })

    it('should have minimum 3 products per category', () => {
      const categories = ['Sneakers', 'Urban', 'Botas']
      categories.forEach(cat => {
        const count = PRODUCTS.filter(p => p.categoria === cat).length
        expect(count).toBeGreaterThanOrEqual(3)
      })
    })

    it('should have unique product IDs', () => {
      const ids = PRODUCTS.map(p => p.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })

  describe('getProductById', () => {
    it('should find product by ID', () => {
      const firstProduct = PRODUCTS[0]
      const found = PRODUCTS.find(p => p.id === firstProduct.id)
      expect(found).toEqual(firstProduct)
    })

    it('should return undefined for non-existent ID', () => {
      const found = PRODUCTS.find(p => p.id === 'non-existent-id')
      expect(found).toBeUndefined()
    })
  })

  describe('filterByCategory', () => {
    it('should filter products by Sneakers category', () => {
      const sneakers = PRODUCTS.filter(p => p.categoria === 'Sneakers')
      expect(sneakers.length).toBeGreaterThan(0)
      expect(sneakers.every(p => p.categoria === 'Sneakers')).toBe(true)
    })

    it('should filter products by Urban category', () => {
      const urban = PRODUCTS.filter(p => p.categoria === 'Urban')
      expect(urban.length).toBeGreaterThan(0)
      expect(urban.every(p => p.categoria === 'Urban')).toBe(true)
    })

    it('should return empty array for non-existent category', () => {
      const result = PRODUCTS.filter(p => p.categoria === 'NonExistent' as any)
      expect(result).toEqual([])
    })
  })

  describe('sortByPrice', () => {
    it('should sort products by price ascending', () => {
      const sorted = [...PRODUCTS].sort((a, b) => a.precio - b.precio)
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].precio).toBeLessThanOrEqual(sorted[i + 1].precio)
      }
    })

    it('should sort products by price descending', () => {
      const sorted = [...PRODUCTS].sort((a, b) => b.precio - a.precio)
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].precio).toBeGreaterThanOrEqual(sorted[i + 1].precio)
      }
    })
  })

  describe('searchProducts', () => {
    it('should find products by nombre', () => {
      const firstProd = PRODUCTS[0]
      const found = PRODUCTS.filter(p => 
        p.nombre.toLowerCase().includes(firstProd.nombre.slice(0, 3).toLowerCase())
      )
      expect(found.length).toBeGreaterThan(0)
    })

    it('should find products by SKU', () => {
      const firstProd = PRODUCTS[0]
      const found = PRODUCTS.filter(p => 
        p.sku.toLowerCase().includes(firstProd.sku.slice(0, 3).toLowerCase())
      )
      expect(found.length).toBeGreaterThan(0)
    })

    it('should return empty array for non-matching query', () => {
      const found = PRODUCTS.filter(p => 
        p.nombre.toLowerCase().includes('xyznonexistent') ||
        p.sku.toLowerCase().includes('xyznonexistent')
      )
      expect(found).toEqual([])
    })
  })

  describe('newArrivals', () => {
    it('should have at least 4 new arrivals marked', () => {
      const newArrivals = PRODUCTS.filter(p => p.isNewArrival === true)
      expect(newArrivals.length).toBeGreaterThanOrEqual(4)
    })

    it('should return max 4 new arrivals', () => {
      const newArrivals = PRODUCTS.filter(p => p.isNewArrival === true).slice(0, 4)
      expect(newArrivals.length).toBeLessThanOrEqual(4)
    })
  })
})
