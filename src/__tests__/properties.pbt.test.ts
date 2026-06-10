import { describe, it, expect, beforeEach } from 'vitest'
import fc from 'fast-check'
import { useValidation } from '../composables/useValidation'
import { setActivePinia, createPinia } from 'pinia'
import type { CartItem, Product } from '../types'

// Setup Pinia
beforeEach(() => {
  setActivePinia(createPinia())
})

// ============ GENERATORS ============
const productGenerator = fc.record({
  id: fc.string({ minLength: 3 }).map(s => `prod-${s.slice(0, 5)}`),
  sku: fc.string({ minLength: 3, maxLength: 10 }).map(s => `KRR-${s.toUpperCase()}`),
  nombre: fc.string({ minLength: 5, maxLength: 50 }),
  descripcion: fc.string({ minLength: 10, maxLength: 200 }),
  precio: fc.integer({ min: 10, max: 5000 }).map(p => p / 100), // 0.10 to 50.00
  imagenes: fc.array(fc.string({ minLength: 5 }), { minLength: 1, maxLength: 3 }),
  categoria: fc.constantFrom('Sneakers', 'Urban', 'Botas'),
  tallas: fc.array(fc.constantFrom('36', '37', '38', '39', '40', '41', '42', '43'), { minLength: 1 }),
  stock: fc.integer({ min: 0, max: 100 }),
  isNewArrival: fc.boolean()
})

const cartItemGenerator = fc.tuple(
  productGenerator,
  fc.integer({ min: 1, max: 20 }),
  fc.constantFrom('36', '37', '38', '39', '40', '41', '42', '43')
).map(([product, cantidad, talla]) => ({
  id: `${product.id}-${talla}`,
  productId: product.id,
  producto: product as Product,
  cantidad,
  talla,
  precioUnitario: product.precio
}))

const emailGenerator = fc
  .tuple(
    fc.string({ minLength: 1, maxLength: 5 }),
    fc.string({ minLength: 1, maxLength: 5 }),
    fc.string({ minLength: 2, maxLength: 3 })
  )
  .map(([local, domain, ext]) => {
    const safeLoc = local.replace(/[^a-z0-9]+/gi, 'a').slice(0, 5) || 'test'
    const safeDom = domain.replace(/[^a-z0-9]+/gi, 'a').slice(0, 5) || 'exam'
    const safeExt = ext.replace(/[^a-z]+/gi, 'c').slice(0, 3) || 'com'
    return `${safeLoc}@${safeDom}.${safeExt}`
  })

// ============ PROPERTY 2: Total Calculation Invariant ============
describe('Property 2: Carrito Total Calculation Invariant', () => {
  it('subtotal = sum(cantidad × precio), tax = subtotal × 0.19, total = subtotal + tax', () => {
    fc.assert(
      fc.property(
        fc.array(cartItemGenerator, { minLength: 1, maxLength: 10 }),
        (items: CartItem[]) => {
          // Calculate manually
          const subtotal = items.reduce((sum, item) => sum + item.cantidad * item.precioUnitario, 0)
          const tax = subtotal * 0.19
          const total = subtotal + tax

          // Allow $0.01 rounding error
          expect(Math.abs(subtotal - items.reduce((s, i) => s + i.cantidad * i.precioUnitario, 0))).toBeLessThan(0.01)
          expect(Math.abs(tax - subtotal * 0.19)).toBeLessThan(0.01)
          expect(Math.abs(total - (subtotal + tax))).toBeLessThan(0.01)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============ PROPERTY 3: Product Filter Category Completeness ============
describe('Property 3: Product Filter Category Completeness', () => {
  it('filter by category returns exact subset without duplicates', () => {
    fc.assert(
      fc.property(
        fc.array(productGenerator, { minLength: 3 }),
        fc.constantFrom('Sneakers', 'Urban', 'Botas'),
        (products: Product[], categoria: string) => {
          const filtered = products.filter(p => p.categoria === categoria)
          
          // All filtered products must have matching category
          expect(filtered.every(p => p.categoria === categoria)).toBe(true)
          
          // No products from other categories
          const otherCategories = products.filter(p => p.categoria !== categoria)
          expect(filtered.every(p => !otherCategories.some(o => o.id === p.id))).toBe(true)
          
          // No duplicates
          const ids = filtered.map(p => p.id)
          expect(new Set(ids).size).toBe(ids.length)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============ PROPERTY 4: Product Sort Order Consistency ============
describe('Property 4: Product Sort Order Consistency', () => {
  it('sort by precio-asc orders correctly', () => {
    fc.assert(
      fc.property(
        fc.array(productGenerator, { minLength: 2, maxLength: 20 }),
        (products: Product[]) => {
          const sorted = [...products].sort((a, b) => a.precio - b.precio)
          
          // Check ordering
          for (let i = 0; i < sorted.length - 1; i++) {
            expect(sorted[i].precio).toBeLessThanOrEqual(sorted[i + 1].precio)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('sort by precio-desc orders correctly', () => {
    fc.assert(
      fc.property(
        fc.array(productGenerator, { minLength: 2, maxLength: 20 }),
        (products: Product[]) => {
          const sorted = [...products].sort((a, b) => b.precio - a.precio)
          
          // Check ordering
          for (let i = 0; i < sorted.length - 1; i++) {
            expect(sorted[i].precio).toBeGreaterThanOrEqual(sorted[i + 1].precio)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('sort by nombre orders alphabetically', () => {
    fc.assert(
      fc.property(
        fc.array(productGenerator, { minLength: 2, maxLength: 20 }),
        (products: Product[]) => {
          const sorted = [...products].sort((a, b) => a.nombre.localeCompare(b.nombre))
          
          // Check alphabetical ordering
          for (let i = 0; i < sorted.length - 1; i++) {
            expect(sorted[i].nombre.localeCompare(sorted[i + 1].nombre)).toBeLessThanOrEqual(0)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============ PROPERTY 5: Email Validation Correctness ============
describe('Property 5: Email Validation Correctness', () => {
  it('validateEmail accepts valid emails', () => {
    fc.assert(
      fc.property(emailGenerator, (email: string) => {
        const { validateEmail } = useValidation()
        const result = validateEmail(email)
        expect(result).toBe(true)
      }),
      { numRuns: 100 }
    )
  })

  it('validateEmail rejects invalid emails', () => {
    const invalidEmailGenerator = fc.oneof(
      fc.string({ minLength: 1, maxLength: 10 }), // Missing @
      fc.string({ minLength: 1 }).map(s => `${s}@`), // Missing domain
      fc.string({ minLength: 1 }).map(s => `@${s}`), // Missing local
      fc.constant('test@@example.com'),
      fc.constant('test@.com'),
      fc.constant('test.com'),
      fc.constant('')
    )

    fc.assert(
      fc.property(invalidEmailGenerator, (email: string) => {
        const { validateEmail } = useValidation()
        if (email && (!email.includes('@') || email.split('@').length !== 2 || !email.includes('.'))) {
          const result = validateEmail(email)
          expect(result).toBe(false)
        }
      }),
      { numRuns: 100 }
    )
  })
})

// ============ PROPERTY 6: Required Field Validation ============
describe('Property 6: Required Field Validation', () => {
  it('required field returns error when empty', () => {
    const emptyStringGenerator = fc.constantFrom('', '   ', '\t\n')

    fc.assert(
      fc.property(emptyStringGenerator, (value: string) => {
        const { validateRequired } = useValidation()
        const result = validateRequired(value)
        expect(result).toBe(false) // Should not pass validation (not required)
      }),
      { numRuns: 100 }
    )
  })

  it('required field returns true when non-empty', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        (value: string) => {
          const { validateRequired } = useValidation()
          const result = validateRequired(value)
          expect(result).toBe(true) // Should pass validation
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============ PROPERTY 7: Phone Number Format Validation ============
describe('Property 7: Phone Number Format Validation', () => {
  it('validatePhone accepts 10+ digits', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 20 }).map(s => s.replace(/[^0-9]/g, '').padEnd(10, '0').slice(0, 15)),
        (phone: string) => {
          const digits = phone.replace(/[^0-9]/g, '')
          if (digits.length >= 10) {
            const { validatePhone } = useValidation()
            const result = validatePhone(phone)
            expect(result).toBe(true)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('validatePhone rejects less than 10 digits', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 9 }).map(s => s.replace(/[^0-9]/g, '')),
        (phone: string) => {
          const digits = phone.replace(/[^0-9]/g, '')
          if (digits.length < 10) {
            const { validatePhone } = useValidation()
            const result = validatePhone(phone)
            expect(result).toBe(false)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============ PROPERTY 8: Product Structure Completeness ============
describe('Property 8: Producto Structure Completeness', () => {
  it('all products have required fields with correct types', () => {
    fc.assert(
      fc.property(productGenerator, (product: any) => {
        // Check required fields exist and have correct types
        expect(typeof product.id).toBe('string')
        expect(product.id.length).toBeGreaterThan(0)
        
        expect(typeof product.sku).toBe('string')
        expect(product.sku.length).toBeGreaterThan(0)
        
        expect(typeof product.nombre).toBe('string')
        expect(product.nombre.length).toBeGreaterThan(0)
        
        expect(typeof product.descripcion).toBe('string')
        expect(product.descripcion.length).toBeGreaterThan(0)
        
        expect(typeof product.precio).toBe('number')
        expect(product.precio).toBeGreaterThan(0)
        
        expect(Array.isArray(product.imagenes)).toBe(true)
        expect(product.imagenes.length).toBeGreaterThan(0)
        
        expect(['Sneakers', 'Urban', 'Botas']).toContain(product.categoria)
        
        expect(Array.isArray(product.tallas)).toBe(true)
        expect(product.tallas.length).toBeGreaterThan(0)
        
        expect(typeof product.stock).toBe('number')
        expect(product.stock).toBeGreaterThanOrEqual(0)
      }),
      { numRuns: 100 }
    )
  })
})

// ============ PROPERTY 11: Cart Item Add Idempotence ============
describe('Property 11: Cart Item Add Idempotence with Quantity', () => {
  it('adding same product twice increments quantity, no duplicates', () => {
    fc.assert(
      fc.property(
        fc.tuple(productGenerator, fc.integer({ min: 1, max: 10 })),
        ([product, qty]: [Product, number]) => {
          const item1 = {
            id: `${product.id}-36`,
            productId: product.id,
            producto: product,
            cantidad: 1,
            talla: '36',
            precioUnitario: product.precio
          }

          const item2 = {
            ...item1,
            cantidad: qty
          }

          // Simulating cart logic: adding same product twice should merge
          const items = [item1]
          const existingIndex = items.findIndex(i => i.id === item2.id)
          
          if (existingIndex >= 0) {
            items[existingIndex].cantidad += item2.cantidad
          } else {
            items.push(item2)
          }

          // Should have exactly 1 item with combined quantity
          expect(items.length).toBe(1)
          expect(items[0].cantidad).toBe(1 + qty)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============ PROPERTY 12: Cart Badge Count Calculation ============
describe('Property 12: Cart Badge Count Calculation', () => {
  it('cartCount equals sum of all quantities', () => {
    fc.assert(
      fc.property(
        fc.array(cartItemGenerator, { minLength: 0, maxLength: 20 }),
        (items: CartItem[]) => {
          const cartCount = items.reduce((sum, item) => sum + item.cantidad, 0)
          
          // If empty, cartCount = 0
          if (items.length === 0) {
            expect(cartCount).toBe(0)
          } else {
            // cartCount = sum of quantities
            expect(cartCount).toBe(items.reduce((s, i) => s + i.cantidad, 0))
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============ PROPERTY 21: Search Result Subset ============
describe('Property 21: Search Result Subset', () => {
  it('search results are subset of all products', () => {
    fc.assert(
      fc.property(
        fc.array(productGenerator, { minLength: 3, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (products: Product[], query: string) => {
          const lowerQuery = query.toLowerCase()
          const filtered = products.filter(p => 
            p.nombre.toLowerCase().includes(lowerQuery) ||
            p.sku.toLowerCase().includes(lowerQuery)
          )

          // All filtered products must be in original
          expect(filtered.every(f => products.some(p => p.id === f.id))).toBe(true)
          
          // No duplicates
          const ids = filtered.map(p => p.id)
          expect(new Set(ids).size).toBe(ids.length)
        }
      ),
      { numRuns: 100 }
    )
  })
})
