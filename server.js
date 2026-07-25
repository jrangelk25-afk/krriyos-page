import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const envPath = join(__dirname, '.env')

console.log('Loading env from:', envPath)
dotenv.config({ path: envPath })
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓ loaded' : '✗ not loaded')

let cachedPrisma = null

const getPrismaInstance = () => {
  if (!cachedPrisma) {
    throw new Error('Prisma not initialized yet')
  }
  return cachedPrisma
}

// Inicializar Prisma de forma asíncrona
;(async () => {
  const { getPrisma } = await import('./lib/prisma.ts')
  const { getRedisClient } = await import('./lib/cache.ts')
  
  cachedPrisma = getPrisma()
  console.log('✅ Prisma initialized successfully')
  
  // Initialize Redis in background (doesn't block startup if fails)
  getRedisClient().catch(err => {
    console.warn('⚠️  Redis initialization warning:', err)
  })
})().catch(err => {
  console.error('❌ Failed to initialize Prisma:', err)
  process.exit(1)
})

// Usar un proxy para acceso transparent a prisma
const prisma = new Proxy({}, {
  get(target, prop) {
    if (!cachedPrisma) {
      throw new Error('Prisma not yet initialized')
    }
    return cachedPrisma[prop]
  }
})

const app = express()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d'

// Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

app.use(cors())
app.use(express.json({ limit: '15mb' }))
app.use(express.urlencoded({ limit: '15mb', extended: true }))

// Middleware para verificar token
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch {
    return null
  }
}

// ==================== AUTH ====================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validar entrada
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email y contraseña son requeridos',
      })
    }

    // Validar formato de email
    if (!email.includes('@')) {
      return res.status(400).json({
        error: 'Email inválido',
      })
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Contraseña debe tener al menos 6 caracteres',
      })
    }

    // Buscar admin en BD
    const admin = await prisma.adminUser.findUnique({
      where: { email },
    })

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        error: 'Credenciales inválidas o usuario inactivo',
      })
    }

    // Verificar contraseña con bcrypt
    let passwordMatch = false
    try {
      passwordMatch = await bcrypt.compare(password, admin.passwordHash)
    } catch (error) {
      console.error('Error comparing passwords:', error)
      return res.status(500).json({
        error: 'Error verificando credenciales',
      })
    }

    if (!passwordMatch) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
      })
    }

    // Generar JWT
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    // Actualizar lastLogin
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    })

    return res.status(200).json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({
      error: 'Error interno del servidor',
    })
  }
})

// ==================== DASHBOARD ====================
app.get('/api/admin/dashboard', async (req, res) => {
  const DASHBOARD_CACHE_KEY = 'dashboard:stats'
  const DASHBOARD_CACHE_TTL = 5 * 60 // 5 minutos
  
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    // Try to get from cache first
    const { getCacheValue } = await import('./lib/cache.ts')
    const cached = await getCacheValue(DASHBOARD_CACHE_KEY)
    
    if (cached) {
      console.log('✓ Dashboard data from cache (age check)')
      return res.status(200).json(cached)
    }

    // Not in cache, fetch fresh data
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    // Parallelizar todas las queries para máximo performance
    const [totalOrders, totalCustomers, totalProducts, orderStats, recentOrders, lowStockProducts, ordersByMonth] = await Promise.all([
      prisma.order.count(),
      prisma.customer.count(),
      prisma.product.count(),
      prisma.order.aggregate({
        _sum: {
          total: true,
        },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      }),
      prisma.product.findMany({
        where: {
          stock: {
            lte: 5,
          },
        },
        take: 5,
        orderBy: { stock: 'asc' },
      }),
      prisma.order.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: {
            gte: sixMonthsAgo,
          },
        },
        _sum: {
          total: true,
        },
        _count: true,
      }),
    ])

    const dashboardData = {
      stats: {
        totalOrders,
        totalCustomers,
        totalProducts,
        totalRevenue: orderStats._sum.total || 0,
      },
      recentOrders,
      lowStockProducts,
      salesByMonth: ordersByMonth,
    }

    // Store in cache for future requests
    const { setCacheValue } = await import('./lib/cache.ts')
    await setCacheValue(DASHBOARD_CACHE_KEY, dashboardData, DASHBOARD_CACHE_TTL)

    return res.status(200).json(dashboardData)
  } catch (error) {
    console.error('Dashboard error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ==================== ORDERS ====================
app.get('/api/admin/orders', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    // Get pagination params
    const page = parseInt(String(req.query.page)) || 1
    const limit = parseInt(String(req.query.limit)) || 20
    const statusParam = req.query.status

    // Build where clause
    let where = {}
    if (statusParam && statusParam !== 'undefined') {
      where.status = statusParam
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Fetch orders with pagination
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    return res.status(200).json({
      orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Orders fetch error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/api/admin/orders/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    return res.status(200).json(order)
  } catch (error) {
    console.error('Order detail error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

app.patch('/api/admin/orders/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const { status, notes } = req.body

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        ...(status && { status }),
        ...(notes && { notes }),
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    return res.status(200).json(order)
  } catch (error) {
    console.error('Order update error:', error)
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Order not found' })
    }
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ==================== PRODUCTS ====================
app.get('/api/admin/products', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const products = await prisma.product.findMany({
      include: {
        category: true,
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        sizes: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return res.status(200).json(products)
  } catch (error) {
    console.error('Products fetch error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/api/admin/products/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    // OPTIMIZED: Batch queries instead of nested includes
    // Query 1: Product with basic data (no nested includes)
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        colors: {
          orderBy: { displayOrder: 'asc' },
        },
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        sizes: {
          orderBy: { id: 'asc' },
        },
      },
    })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // Query 2: Batch fetch ALL size-color mappings (NO N+1)
    const sizeIds = product.sizes.map(s => s.id)
    const sizeColorMappings = await prisma.productSizeColor.findMany({
      where: {
        sizeId: { in: sizeIds },
      },
      include: {
        color: {
          select: {
            id: true,
            name: true,
            hexCode: true,
            displayOrder: true,
          },
        },
      },
    })

    // Enrich sizes with colors (EN MEMORIA)
    const enrichedSizes = product.sizes.map(size => {
      const colors = sizeColorMappings
        .filter(mapping => mapping.sizeId === size.id)
        .map(mapping => ({
          id: mapping.id,
          sizeId: mapping.sizeId,
          color: mapping.color,
        }))

      return {
        ...size,
        colors,
      }
    })

    // Return optimized product
    return res.status(200).json({
      ...product,
      sizes: enrichedSizes,
    })
  } catch (error) {
    console.error('Product detail error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/admin/products', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    // Helper para convertir booleanos
    const parseBoolean = (value) => {
      if (typeof value === 'string') return value === 'true'
      return !!value
    }

    const productData = {
      ...req.body,
      price: parseFloat(req.body.price),
      discountPercentage: req.body.discountPercentage ? parseInt(req.body.discountPercentage) : 0,
      stock: parseInt(req.body.stock) || 0,
      isNewArrival: parseBoolean(req.body.isNewArrival),
      isOutlet: parseBoolean(req.body.isOutlet),
      isActive: parseBoolean(req.body.isActive),
    }

    const product = await prisma.product.create({
      data: productData,
    })

    return res.status(201).json(product)
  } catch (error) {
    console.error('Product create error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

app.put('/api/admin/products/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const { name, description, price, discountPercentage, categoryId, sku, stock, isNewArrival, isOutlet, isActive, image, images, sizes, colors } = req.body
    const updateData = {}

    console.log('=== PUT PRODUCTS/:ID (OPTIMIZED with $transaction) ===')
    console.log('Product ID:', req.params.id)
    console.log('Sizes received:', sizes?.length || 0)
    console.log('Colors received:', colors?.length || 0)

    // Helper para convertir booleanos
    const parseBoolean = (value) => {
      if (typeof value === 'string') return value === 'true'
      return !!value
    }

    if (name) updateData.name = name
    if (description) updateData.description = description
    if (price) updateData.price = parseFloat(price)
    if (discountPercentage !== undefined) updateData.discountPercentage = parseInt(discountPercentage)
    if (categoryId) updateData.categoryId = categoryId
    if (sku) updateData.sku = sku
    if (stock !== undefined) updateData.stock = parseInt(stock)
    if (isNewArrival !== undefined) updateData.isNewArrival = parseBoolean(isNewArrival)
    if (isOutlet !== undefined) updateData.isOutlet = parseBoolean(isOutlet)
    if (isActive !== undefined) updateData.isActive = parseBoolean(isActive)

    // Manejar imágenes ANTES de transacción
    if (images && Array.isArray(images) && images.length > 0) {
      console.log('📸 Processing images...')
      const currentImages = await prisma.productImage.findMany({
        where: { productId: req.params.id },
        orderBy: { displayOrder: 'asc' }
      })

      const imagesChanged = currentImages.length !== images.length ||
        currentImages.some((currentImg, idx) => 
          currentImg.imageUrl !== images[idx]?.imageUrl
        )

      if (imagesChanged) {
        await prisma.productImage.deleteMany({
          where: { productId: req.params.id }
        })
        await prisma.productImage.createMany({
          data: images.map((img, index) => ({
            productId: req.params.id,
            imageUrl: img.imageUrl,
            displayOrder: index,
            isPrimary: index === 0,
            altText: name || `Product image ${index + 1}`,
          })),
        })
      }
    } else if (image) {
      await prisma.productImage.deleteMany({
        where: { productId: req.params.id }
      })
      await prisma.productImage.create({
        data: {
          productId: req.params.id,
          imageUrl: image,
          isPrimary: true,
          altText: name || 'Product image',
        },
      })
    }

    // TRANSACTION: Usar $transaction para paralelizar operaciones
    const transactionOps = []
    const colorIdMap = {}

    // 1. PROCESAR COLORES
    if (colors && Array.isArray(colors) && colors.length > 0) {
      console.log('🎨 Processing colors in transaction...')
      const existingProduct = await prisma.product.findUnique({
        where: { id: req.params.id },
        include: { colors: true }
      })

      if (!existingProduct) {
        throw new Error(`Product with id ${req.params.id} not found`)
      }

      const incomingColorIds = new Set(colors.filter((c) => c.id && !c.id.startsWith('new-')).map((c) => c.id))
      const colorsToDelete = existingProduct.colors.filter((c) => !incomingColorIds.has(c.id))

      if (colorsToDelete.length > 0) {
        transactionOps.push(
          prisma.productColor.deleteMany({
            where: { id: { in: colorsToDelete.map((c) => c.id) } }
          })
        )
      }

      for (const colorData of colors) {
        if (colorData.id.startsWith('new-')) {
          transactionOps.push(
            prisma.productColor.create({
              data: {
                productId: req.params.id,
                name: colorData.name,
                hexCode: colorData.hexCode,
                displayOrder: colorData.displayOrder || 0,
                isActive: true,
              }
            })
          )
        } else {
          transactionOps.push(
            prisma.productColor.update({
              where: { id: colorData.id },
              data: {
                name: colorData.name,
                hexCode: colorData.hexCode,
                displayOrder: colorData.displayOrder || 0,
              }
            })
          )
        }
      }
    }

    // 2. PROCESAR TALLAS
    let totalStockFromSizes = 0
    if (sizes && Array.isArray(sizes) && sizes.length > 0) {
      console.log('📏 Processing sizes in transaction...')
      const existingProduct = await prisma.product.findUnique({
        where: { id: req.params.id },
        include: { sizes: true }
      })

      if (!existingProduct) {
        throw new Error(`Product with id ${req.params.id} not found`)
      }

      const incomingSizeIds = new Set(sizes.filter((s) => s.id && !s.id.startsWith('new-')).map((s) => s.id))
      const sizesToDelete = existingProduct.sizes.filter((s) => !incomingSizeIds.has(s.id))

      if (sizesToDelete.length > 0) {
        transactionOps.push(
          prisma.productSize.deleteMany({
            where: { id: { in: sizesToDelete.map((s) => s.id) } }
          })
        )
      }

      for (const sizeData of sizes) {
        const stockValue = sizeData.stock !== undefined ? sizeData.stock : (sizeData.quantity !== undefined ? sizeData.quantity : 0)
        const parsedStock = parseInt(String(stockValue)) || 0
        totalStockFromSizes += parsedStock

        if (sizeData.id.startsWith('new-')) {
          transactionOps.push(
            prisma.productSize.create({
              data: {
                productId: req.params.id,
                size: sizeData.size,
                stock: parsedStock,
              }
            })
          )
        } else {
          transactionOps.push(
            prisma.productSize.update({
              where: { id: sizeData.id },
              data: { stock: parsedStock }
            })
          )
        }
      }

      updateData.stock = totalStockFromSizes
    }

    // 3. ACTUALIZAR PRODUCTO
    transactionOps.push(
      prisma.product.update({
        where: { id: req.params.id },
        data: updateData,
        include: {
          category: true,
          colors: { orderBy: { displayOrder: 'asc' } },
          images: { orderBy: { displayOrder: 'asc' } },
          sizes: {
            include: {
              colors: {
                include: {
                  color: {
                    select: {
                      id: true,
                      name: true,
                      hexCode: true,
                      displayOrder: true,
                    }
                  }
                }
              }
            }
          }
        }
      })
    )

    // Ejecutar transacción
    console.log('⚡ Executing transaction with', transactionOps.length, 'operations...')
    const results = await prisma.$transaction(transactionOps)
    const product = results[results.length - 1] // El update es el último

    // Procesar size-colors DESPUÉS de transacción
    if (sizes && Array.isArray(sizes) && sizes.length > 0) {
      console.log('🔗 Linking sizes and colors...')

      const allColors = await prisma.productColor.findMany({
        where: { productId: req.params.id }
      })

      for (const colorData of colors) {
        if (colorData.id.startsWith('new-')) {
          const newColor = allColors.find((c) => c.name === colorData.name && c.hexCode === colorData.hexCode)
          if (newColor) {
            colorIdMap[colorData.id] = newColor.id
          }
        } else {
          colorIdMap[colorData.id] = colorData.id
        }
      }

      const sizeColorOps = []
      for (const sizeData of sizes) {
        if (sizeData.colorIds && Array.isArray(sizeData.colorIds) && sizeData.colorIds.length > 0) {
          const existingSize = await prisma.productSize.findUnique({
            where: { id: sizeData.id }
          })

          if (existingSize) {
            await prisma.productSizeColor.deleteMany({
              where: { sizeId: sizeData.id }
            })

            for (const tempOrRealColorId of sizeData.colorIds) {
              const realColorId = colorIdMap[tempOrRealColorId] || tempOrRealColorId
              sizeColorOps.push(
                prisma.productSizeColor.create({
                  data: {
                    sizeId: sizeData.id,
                    colorId: realColorId
                  }
                })
              )
            }
          }
        }
      }

      if (sizeColorOps.length > 0) {
        await prisma.$transaction(sizeColorOps)
      }
    }

    console.log('✅ Product updated successfully')
    return res.status(200).json(product)
  } catch (error) {
    console.error('Product update error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' })
  }
})

app.delete('/api/admin/products/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    await prisma.product.delete({
      where: { id: req.params.id },
    })

    return res.status(204).send()
  } catch (error) {
    console.error('Product delete error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ==================== CUSTOMERS ====================
app.get('/api/admin/customers', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const customers = await prisma.customer.findMany({
      include: {
        orders: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return res.status(200).json(customers)
  } catch (error) {
    console.error('Customers fetch error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/api/admin/customers/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        orders: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    })

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' })
    }

    return res.status(200).json(customer)
  } catch (error) {
    console.error('Customer detail error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ==================== CATEGORIES ====================
app.get('/api/admin/categories', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return res.status(200).json(categories)
  } catch (error) {
    console.error('Categories fetch error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/api/admin/categories/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: {
        products: true,
      },
    })

    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }

    return res.status(200).json(category)
  } catch (error) {
    console.error('Category detail error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/admin/categories', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const category = await prisma.category.create({
      data: req.body,
    })

    return res.status(201).json(category)
  } catch (error) {
    console.error('Category create error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

app.put('/api/admin/categories/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: req.body,
    })

    return res.status(200).json(category)
  } catch (error) {
    console.error('Category update error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

app.delete('/api/admin/categories/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    await prisma.category.delete({
      where: { id: req.params.id },
    })

    return res.status(204).send()
  } catch (error) {
    console.error('Category delete error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ==================== ADMIN USERS ====================
app.get('/api/admin/admin-users', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const adminUsers = await prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return res.status(200).json(adminUsers)
  } catch (error) {
    console.error('Admin users fetch error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ==================== AUDIT LOGS ====================
app.get('/api/admin/audit-logs', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return res.status(200).json(logs)
  } catch (error) {
    console.error('Audit logs fetch error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ==================== PUBLIC ENDPOINTS ====================
// Get all active categories
app.get('/api/public/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    })

    return res.status(200).json({
      success: true,
      data: categories,
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
    })
  }
})

// Get all active products (with optional category filter)
app.get('/api/public/products', async (req, res) => {
  try {
    const { categoryId, isOutlet, isNew } = req.query

    let where = { isActive: true }

    if (categoryId && typeof categoryId === 'string') {
      where.categoryId = categoryId
    }

    if (isOutlet === 'true') {
      where.isOutlet = true
    }

    if (isNew === 'true') {
      where.isNewArrival = true
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        colors: {
          orderBy: { displayOrder: 'asc' },
        },
        sizes: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Enrich products with color and size mapping
    const enrichedProducts = await Promise.all(
      products.map(async (product) => {
        const enrichedSizes = await Promise.all(
          product.sizes.map(async (size) => {
            // Get colors specific to this size from the ProductSizeColor junction table
            // Solo obtener colores para esta talla específica
            const sizeColors = await prisma.productSizeColor.findMany({
              where: {
                sizeId: size.id, // ✅ Solo esta talla específica
              },
              include: {
                color: true,
              },
            })

            // Map to colors
            const availableColors = sizeColors
              .map((mapping) => ({
                id: mapping.color.id,
                name: mapping.color.name,
                hexCode: mapping.color.hexCode,
              }))

            return {
              ...size,
              availableColors,
            }
          })
        )

        return {
          ...product,
          sizes: enrichedSizes,
        }
      })
    )

    return res.status(200).json({
      success: true,
      data: enrichedProducts,
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
    })
  }
})

// Get single product by ID
app.get('/api/public/products/:id', async (req, res) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required',
      })
    }

    const product = await prisma.product.findFirst({
      where: {
        AND: [{ id }, { isActive: true }],
      },
      include: {
        category: true,
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        colors: {
          orderBy: { displayOrder: 'asc' },
          include: {
            images: {
              orderBy: { displayOrder: 'asc' },
            },
          },
        },
        sizes: {
          orderBy: { id: 'asc' },
        },
      },
    })

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      })
    }

    // Enrich sizes with available colors
    const enrichedSizes = await Promise.all(
      product.sizes.map(async (size) => {
        // Get colors specific to this size from the ProductSizeColor junction table
        // Solo obtener colores para esta talla específica
        const sizeColors = await prisma.productSizeColor.findMany({
          where: {
            sizeId: size.id, // ✅ Solo esta talla específica
          },
          include: {
            color: true,
          },
        })

        console.log(`DEBUG [size ${size.id} (${product.id})]: encontrados ${sizeColors.length} colores`)
        sizeColors.forEach((sc) => console.log(`  - ${sc.color.name}`))

        // Map to colors
        const availableColors = sizeColors
          .map((mapping) => ({
            id: mapping.color.id,
            name: mapping.color.name,
            hexCode: mapping.color.hexCode,
          }))

        return {
          ...size,
          availableColors,
        }
      })
    )

    return res.status(200).json({
      success: true,
      data: {
        ...product,
        sizes: enrichedSizes,
      },
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch product',
    })
  }
})

// ==================== PRODUCT IMAGES ====================
app.post('/api/admin/products/images', async (req, res) => {
  try {
    console.log('[PRODUCT_IMAGE] Request received:', req.body)
    
    const authHeader = req.headers.authorization
    console.log('[PRODUCT_IMAGE] Auth header:', authHeader ? 'Present' : 'Missing')
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('[PRODUCT_IMAGE] Invalid auth header format')
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    
    console.log('[PRODUCT_IMAGE] Token decoded:', decoded ? 'Valid' : 'Invalid')

    if (!decoded) {
      console.log('[PRODUCT_IMAGE] Invalid token')
      return res.status(401).json({ error: 'Invalid token' })
    }

    const { productId, imageUrl, displayOrder, isPrimary } = req.body

    if (!productId || !imageUrl) {
      console.log('[PRODUCT_IMAGE] Missing productId or imageUrl')
      return res.status(400).json({ error: 'productId and imageUrl are required' })
    }

    console.log(`[PRODUCT_IMAGE] Creating image for product ${productId}, isPrimary: ${isPrimary}`)

    const productImage = await prisma.productImage.create({
      data: {
        productId,
        imageUrl,
        displayOrder: displayOrder || 0,
        isPrimary: isPrimary || false,
        createdBy: decoded.id,
      },
    })

    console.log(`[PRODUCT_IMAGE] ✅ Successfully created image ${productImage.id}`)

    return res.status(201).json(productImage)
  } catch (error) {
    console.error('[PRODUCT_IMAGE] ❌ Error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' })
  }
})

// ==================== IMAGE UPLOAD ====================
app.post('/api/admin/upload-image', async (req, res) => {
  try {
    // Verificar autenticación
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token requerido' })
    }

    const token = authHeader.slice(7)
    
    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido o expirado' })
    }

    // Validar credenciales de Supabase
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Credenciales de Supabase no configuradas')
      return res.status(500).json({ error: 'Error de configuración del servidor' })
    }

    // Parsear y validar datos
    const { fileBase64, fileName, folder } = req.body

    if (!fileBase64 || !fileName || !folder) {
      return res.status(400).json({ 
        error: 'Datos incompletos. Se requieren: fileBase64, fileName, folder' 
      })
    }

    // Validar folder
    if (typeof folder !== 'string' || !folder.match(/^[a-zA-Z0-9\-_/]+$/)) {
      return res.status(400).json({ error: 'Nombre de carpeta inválido' })
    }

    // Validar fileName
    if (typeof fileName !== 'string' || fileName.length === 0) {
      return res.status(400).json({ error: 'Nombre de archivo inválido' })
    }

    // Validar extensión y MIME type
    const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif']
    const fileExtension = fileName.split('.').pop()?.toLowerCase()
    
    if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return res.status(400).json({ 
        error: `Extensión no permitida. Permitidas: ${ALLOWED_EXTENSIONS.join(', ')}` 
      })
    }

    // Decodificar base64
    let buffer
    try {
      buffer = Buffer.from(fileBase64, 'base64')
    } catch {
      return res.status(400).json({ error: 'Archivo base64 inválido' })
    }

    // Validar tamaño (11MB)
    const MAX_FILE_SIZE = 11 * 1024 * 1024
    if (buffer.length > MAX_FILE_SIZE) {
      return res.status(400).json({ 
        error: `Archivo demasiado grande. Máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB` 
      })
    }

    // Validar que no esté vacío
    if (buffer.length === 0) {
      return res.status(400).json({ error: 'Archivo vacío' })
    }

    // Crear cliente de Supabase con clave de servicio
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Generar nombre único
    const timestamp = Date.now()
    const uniqueFileName = `${timestamp}-${decoded.id.slice(0, 8)}-${fileName}`
    const filePath = `${folder}/${uniqueFileName}`

    // Subir a Supabase
    const { data, error } = await supabase.storage
      .from('krriyos-images')
      .upload(filePath, buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`,
      })

    if (error) {
      console.error('Error de Supabase:', error)
      return res.status(400).json({ 
        error: `Error al subir imagen: ${error.message}` 
      })
    }

    // Obtener URL pública
    const { data: publicUrl } = supabase.storage
      .from('krriyos-images')
      .getPublicUrl(data.path)

    console.log(`[UPLOAD] User ${decoded.email} uploaded file: ${filePath}`)

    return res.status(200).json({
      success: true,
      path: data.path,
      publicUrl: publicUrl.publicUrl,
      fileName: uniqueFileName,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return res.status(500).json({
      error: 'Error interno del servidor',
    })
  }
})

// ==================== IMAGE DELETE ====================
app.post('/api/admin/delete-image', async (req, res) => {
  try {
    // Verificar autenticación
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token requerido' })
    }

    const token = authHeader.slice(7)
    
    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido o expirado' })
    }

    // Validar credenciales de Supabase
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Credenciales de Supabase no configuradas')
      return res.status(500).json({ error: 'Error de configuración del servidor' })
    }

    // Parsear y validar datos
    const { filePath } = req.body

    if (!filePath || typeof filePath !== 'string') {
      return res.status(400).json({ error: 'filePath requerido y debe ser string' })
    }

    // Validar seguridad de ruta
    if (filePath.includes('..') || filePath.startsWith('/')) {
      return res.status(400).json({ error: 'Ruta de archivo inválida' })
    }

    // Crear cliente de Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Eliminar de Supabase
    const { error } = await supabase.storage
      .from('krriyos-images')
      .remove([filePath])

    if (error) {
      console.error('Error de Supabase:', error)
      return res.status(400).json({ 
        error: `Error al eliminar imagen: ${error.message}` 
      })
    }

    console.log(`[DELETE] User ${decoded.email} deleted file: ${filePath}`)

    return res.status(200).json({
      success: true,
      message: 'Imagen eliminada exitosamente',
    })
  } catch (error) {
    console.error('Delete error:', error)
    return res.status(500).json({
      error: 'Error interno del servidor',
    })
  }
})

// ==================== PUBLIC ORDERS ====================
app.post('/api/public/orders', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  
  try {
    console.log('[ORDER] Received order creation request')
    console.log('[ORDER] Body:', JSON.stringify(req.body, null, 2))

    const { orderNumber, fullName, email, phone, country, city, address, items, subtotal, total } = req.body

    // Validation
    if (!orderNumber || !fullName || !email || !phone || !country || !city || !address || !items) {
      console.log('[ORDER] ❌ Missing fields:', {
        orderNumber: !!orderNumber,
        fullName: !!fullName,
        email: !!email,
        phone: !!phone,
        country: !!country,
        city: !!city,
        address: !!address,
        items: !!items,
      })
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      })
    }

    if (!Array.isArray(items) || items.length === 0) {
      console.log('[ORDER] ❌ Invalid items:', items)
      return res.status(400).json({
        success: false,
        error: 'Order must have at least one item',
      })
    }

    console.log('[ORDER] ✓ Validation passed')
    console.log('[ORDER] Creating customer for email:', email)

    // Find or create customer
    let customer = await prisma.customer.findUnique({
      where: { email },
    })

    if (!customer) {
      console.log('[ORDER] Creating new customer')
      customer = await prisma.customer.create({
        data: {
          email,
          fullName,
          phone,
        },
      })
      console.log('[ORDER] ✓ Customer created:', customer.id)
    } else {
      console.log('[ORDER] ✓ Customer found:', customer.id)
    }

    console.log('[ORDER] Creating order with', items.length, 'items')

    // Create order with items and update stock
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        fullName,
        phone,
        country,
        city,
        address,
        subtotal: subtotal || 0,
        tax: 0,
        total: total || subtotal || 0,
        status: 'PENDING',
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        items: true,
        customer: true,
      },
    })

    console.log('[ORDER] ✓ Order created successfully:', order.id)

    // Update product stock and size stock
    console.log('[ORDER] Updating inventory for products')
    for (const item of items) {
      try {
        // Get current product stock
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        })
        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity)
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: newStock },
          })
          console.log(`[ORDER] ✓ Product ${item.productId} stock: ${product.stock} → ${newStock}`)
        }

        // Get current product size stock and update
        const sizes = await prisma.productSize.findMany({
          where: {
            productId: item.productId,
            size: item.size,
          },
        })
        for (const size of sizes) {
          const newSizeStock = Math.max(0, size.stock - item.quantity)
          await prisma.productSize.update({
            where: { id: size.id },
            data: { stock: newSizeStock },
          })
          console.log(`[ORDER] ✓ Product size ${item.size} for ${item.productId}: ${size.stock} → ${newSizeStock}`)
        }
      } catch (err) {
        console.error(`[ORDER] ⚠️ Error updating inventory for item ${item.productId}:`, err.message)
      }
    }

    return res.status(201).json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
      },
    })
  } catch (error) {
    console.error('[ORDER] ❌ Error creating order:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error creating order',
    })
  }
})

// ==================== ADMIN CUSTOMERS ====================
app.options('/api/admin/customers', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  res.status(200).end()
})

app.get('/api/admin/customers', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  
  try {
    console.log('[CUSTOMERS] Request received')
    console.log('[CUSTOMERS] Headers:', req.headers)
    
    const authHeader = req.headers.authorization
    console.log('[CUSTOMERS] Auth header:', authHeader ? 'present' : 'missing')
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('[CUSTOMERS] ❌ No valid auth header')
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.substring(7)
    console.log('[CUSTOMERS] Token:', token.substring(0, 20) + '...')
    
    const decoded = verifyToken(token)
    console.log('[CUSTOMERS] Token verified:', !!decoded)
    
    if (!decoded) {
      console.log('[CUSTOMERS] ❌ Invalid token')
      return res.status(401).json({ error: 'Invalid token' })
    }

    const { page, limit } = req.query
    const pageNum = parseInt(String(page)) || 1
    const limitNum = parseInt(String(limit)) || 20
    const skip = (pageNum - 1) * limitNum

    console.log('[CUSTOMERS] Fetching customers - page:', pageNum, 'limit:', limitNum)

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          isNewsletterSubscriber: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.customer.count(),
    ])

    console.log('[CUSTOMERS] ✓ Found', customers.length, 'customers out of', total, 'total')

    return res.status(200).json({
      customers,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    })
  } catch (error) {
    console.error('[CUSTOMERS] ❌ Error:', error)
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' })
  }
})

// ==================== ERROR HANDLING ====================
// Servir archivos estáticos del frontend con estrategia de caching
app.use(express.static(join(__dirname, 'dist'), {
  maxAge: '1d',        // Cache por 1 día para assets (JS, CSS, images)
  etag: false,         // Deshabilitar ETag para ahorrar CPU
  setHeaders: (res, path) => {
    // Para HTML: cache más corto (1 hora) para que cambios se vean rápido
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate')
      res.setHeader('X-Content-Type-Options', 'nosniff')
      return
    }
    // Para assets con hash (vite los genera con hash): cache largo e inmutable
    if (path.match(/\.[a-f0-9]{8}\.(js|css|woff2|woff|ttf|eot|svg)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      return
    }
    // Para assets normales: cache 7 días
    if (path.match(/\.(js|css|woff2|woff|ttf|eot|svg|png|jpg|jpeg|gif|webp)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=604800')
    }
  }
}))

// Ruta fallback para SPA - servir index.html para todas las rutas no-API
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// Start server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
  console.log(`📌 API endpoints available at http://localhost:${PORT}/api`)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...')
  const { disconnectPrisma } = await import('./lib/prisma.ts')
  const { disconnectRedis } = await import('./lib/cache.ts')
  await disconnectPrisma()
  await disconnectRedis()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...')
  const { disconnectPrisma } = await import('./lib/prisma.ts')
  const { disconnectRedis } = await import('./lib/cache.ts')
  await disconnectPrisma()
  await disconnectRedis()
  process.exit(0)
})
