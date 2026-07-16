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
  cachedPrisma = getPrisma()
  console.log('✅ Prisma initialized successfully')
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

    // Obtener estadísticas
    const totalOrders = await prisma.order.count()
    const totalCustomers = await prisma.customer.count()
    const totalProducts = await prisma.product.count()

    // Ingresos totales
    const orderStats = await prisma.order.aggregate({
      _sum: {
        total: true,
      },
    })

    // Órdenes recientes
    const recentOrders = await prisma.order.findMany({
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
    })

    // Productos con bajo stock
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lte: 5,
        },
      },
      take: 5,
      orderBy: { stock: 'asc' },
    })

    // Órdenes por mes (últimos 6 meses)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const ordersByMonth = await prisma.order.groupBy({
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
    })

    return res.status(200).json({
      stats: {
        totalOrders,
        totalCustomers,
        totalProducts,
        totalRevenue: orderStats._sum.total || 0,
      },
      recentOrders,
      lowStockProducts,
      salesByMonth: ordersByMonth,
    })
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

    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return res.status(200).json(orders)
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

    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        colors: {
          orderBy: { displayOrder: 'asc' },
          include: {
            images: {
              orderBy: { displayOrder: 'asc' },
            },
          },
        },
        images: {
          orderBy: { displayOrder: 'asc' },
        },
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
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    return res.status(200).json(product)
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

    const { name, description, price, categoryId, sku, stock, isNewArrival, isOutlet, isActive, image, images, sizes, colors } = req.body
    const updateData = {}

    console.log('=== PUT PRODUCTS/:ID ===')
    console.log('Product ID:', req.params.id)
    console.log('Sizes received:', sizes)
    console.log('Colors received:', colors)

    // Helper para convertir booleanos
    const parseBoolean = (value) => {
      if (typeof value === 'string') return value === 'true'
      return !!value
    }

    if (name) updateData.name = name
    if (description) updateData.description = description
    if (price) updateData.price = parseFloat(price)
    if (categoryId) updateData.categoryId = categoryId
    if (sku) updateData.sku = sku
    if (stock !== undefined) updateData.stock = parseInt(stock)
    if (isNewArrival !== undefined) updateData.isNewArrival = parseBoolean(isNewArrival)
    if (isOutlet !== undefined) updateData.isOutlet = parseBoolean(isOutlet)
    if (isActive !== undefined) updateData.isActive = parseBoolean(isActive)

    // Manejar múltiples imágenes
    if (images && Array.isArray(images) && images.length > 0) {
      console.log('📸 Images provided, checking if they changed...')
      
      // Obtener imágenes actuales
      const currentImages = await prisma.productImage.findMany({
        where: { productId: req.params.id },
        orderBy: { displayOrder: 'asc' }
      })
      
      console.log('Current images in DB:', currentImages.length)
      console.log('New images provided:', images.length)
      
      // Comparar si realmente cambiaron
      const imagesChanged = currentImages.length !== images.length ||
        currentImages.some((currentImg, idx) => 
          currentImg.imageUrl !== images[idx]?.imageUrl
        )
      
      if (imagesChanged) {
        console.log('✏️ Images changed, updating...')
        // Eliminar todas las imágenes existentes
        await prisma.productImage.deleteMany({
          where: { productId: req.params.id }
        })
        
        // Luego crear las nuevas imágenes
        await prisma.productImage.createMany({
          data: images.map((img, index) => ({
            productId: req.params.id,
            imageUrl: img.imageUrl,
            displayOrder: index,
            isPrimary: index === 0,
            altText: name || `Product image ${index + 1}`,
          })),
        })
        console.log('✅ Images updated successfully')
      } else {
        console.log('⏭️ Images unchanged, skipping update')
      }
    } else if (image) {
      // Modo legado: una sola imagen
      console.log('🖼️ Single image provided (legacy mode), updating...')
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
      console.log('✅ Single image updated successfully')
    }

    // PRIMERO: PROCESAR COLORES y MAPEAR IDs TEMPORALES A IDs REALES
    const colorIdMap = {} // Mapeo de IDs temporales 'new-xxx' a IDs reales
    
    if (colors && Array.isArray(colors) && colors.length > 0) {
      console.log('🎨 Processing colors:', JSON.stringify(colors, null, 2))
      
      try {
        // Obtener colores existentes del producto
        const existingProduct = await prisma.product.findUnique({
          where: { id: req.params.id },
          include: { colors: true },
        })

        if (!existingProduct) {
          throw new Error(`Product with id ${req.params.id} not found during color processing`)
        }

        // IDs de colores que se mantienen (excluyendo los nuevos que empiezan con 'new-')
        const incomingColorIds = new Set(colors.filter((c) => c.id && !c.id.startsWith('new-')).map((c) => c.id))
        
        // Eliminar colores que ya no existen
        const colorsToDelete = existingProduct.colors.filter((c) => !incomingColorIds.has(c.id)) || []
        if (colorsToDelete.length > 0) {
          console.log('🗑️ Deleting colors:', colorsToDelete)
          await prisma.productColor.deleteMany({
            where: { id: { in: colorsToDelete.map((c) => c.id) } },
          })
          console.log(`✅ Deleted ${colorsToDelete.length} colors`)
        }

        // Crear/actualizar colores
        for (const colorData of colors) {
          console.log(`Processing color: id=${colorData.id}, starts with new-? ${colorData.id.startsWith('new-')}`)
          
          if (colorData.id.startsWith('new-')) {
            // Nuevo color
            console.log(`✨ Creating new color: ${colorData.name} (${colorData.hexCode})`)
            const createdColor = await prisma.productColor.create({
              data: {
                productId: req.params.id,
                name: colorData.name,
                hexCode: colorData.hexCode,
                displayOrder: colorData.displayOrder || 0,
                isActive: true,
              },
            })
            console.log('✅ Color created successfully:', createdColor)
            // Mapear ID temporal a ID real
            colorIdMap[colorData.id] = createdColor.id
            console.log(`📍 Mapped temp ID ${colorData.id} to real ID ${createdColor.id}`)
          } else {
            // Actualizar color existente
            console.log(`📝 Updating existing color: ${colorData.id}`)
            const updatedColor = await prisma.productColor.update({
              where: { id: colorData.id },
              data: {
                name: colorData.name,
                hexCode: colorData.hexCode,
                displayOrder: colorData.displayOrder || 0,
              },
            })
            console.log('✅ Color updated successfully:', updatedColor)
            // El ID ya es real, no necesita mapeo
            colorIdMap[colorData.id] = colorData.id
          }
        }
        console.log('✅ All colors processed successfully')
        console.log('Color ID Map:', colorIdMap)
      } catch (colorError) {
        console.error('❌ ERROR PROCESSING COLORS:', colorError)
        throw new Error(`Color processing failed: ${colorError.message}`)
      }
    } else {
      console.log('ℹ️ No colors to process. colors:', colors)
    }

    // SEGUNDO: PROCESAR TALLAS - antes de actualizar el producto
    let totalStockFromSizes = 0
    
    if (sizes && Array.isArray(sizes) && sizes.length > 0) {
      console.log('Processing sizes:', sizes)
      
      try {
        // Obtener tallas existentes
        const existingProduct = await prisma.product.findUnique({
          where: { id: req.params.id },
          include: { sizes: true },
        })

        if (!existingProduct) {
          throw new Error(`Product with id ${req.params.id} not found`)
        }

        // IDs de tallas que se mantienen
        const incomingSizeIds = new Set(sizes.filter((s) => s.id && !s.id.startsWith('new-')).map((s) => s.id))
        
        // Eliminar tallas que ya no existen
        const sizesToDelete = existingProduct.sizes.filter((s) => !incomingSizeIds.has(s.id)) || []
        if (sizesToDelete.length > 0) {
          console.log('Deleting sizes:', sizesToDelete)
          await prisma.productSize.deleteMany({
            where: { id: { in: sizesToDelete.map((s) => s.id) } },
          })
        }

        // Crear/actualizar tallas
        for (const sizeData of sizes) {
          // Extraer el stock - puede venir como 'stock' o como otra propiedad
          const stockValue = sizeData.stock !== undefined ? sizeData.stock : (sizeData.quantity !== undefined ? sizeData.quantity : 0)
          const parsedStock = parseInt(String(stockValue)) || 0
          
          console.log(`Processing size: ${sizeData.size}, stock: ${stockValue} (parsed: ${parsedStock}), id: ${sizeData.id}`)
          
          let createdOrUpdatedSizeId = ''
          
          if (sizeData.id.startsWith('new-')) {
            // Nueva talla
            console.log(`Creating new size: ${sizeData.size} with stock ${parsedStock}`)
            const createdSize = await prisma.productSize.create({
              data: {
                productId: req.params.id,
                size: sizeData.size,
                stock: parsedStock,
              },
            })
            console.log('Size created successfully:', createdSize)
            createdOrUpdatedSizeId = createdSize.id
            totalStockFromSizes += parsedStock
          } else {
            // Actualizar talla existente
            console.log(`Updating existing size: ${sizeData.id} with stock ${parsedStock}`)
            
            // Verificar que la talla existe antes de actualizar
            const existingSize = await prisma.productSize.findUnique({
              where: { id: sizeData.id }
            })
            
            if (!existingSize) {
              console.warn(`Size ${sizeData.id} does not exist, creating it instead`)
              // Si no existe, crearla
              const createdSize = await prisma.productSize.create({
                data: {
                  productId: req.params.id,
                  size: sizeData.size,
                  stock: parsedStock,
                },
              })
              console.log('Size created successfully (was missing):', createdSize)
              createdOrUpdatedSizeId = createdSize.id
            } else {
              const updatedSize = await prisma.productSize.update({
                where: { id: sizeData.id },
                data: {
                  stock: parsedStock,
                },
              })
              console.log('Size updated successfully:', updatedSize)
              createdOrUpdatedSizeId = updatedSize.id
            }
            totalStockFromSizes += parsedStock
          }

          // Procesar colores de la talla
          if (sizeData.colorIds && Array.isArray(sizeData.colorIds) && sizeData.colorIds.length > 0) {
            console.log(`Processing colors for size ${sizeData.size}:`, sizeData.colorIds)
            console.log(`createdOrUpdatedSizeId: ${createdOrUpdatedSizeId}`)

            // Eliminar relaciones existentes de esta talla
            await prisma.productSizeColor.deleteMany({
              where: { sizeId: createdOrUpdatedSizeId }
            })

            // Crear nuevas relaciones para cada color
            for (const tempOrRealColorId of sizeData.colorIds) {
              // Si el colorId es temporal (new-xxx), usar el ID real mapeado
              const realColorId = colorIdMap[tempOrRealColorId] || tempOrRealColorId
              console.log(`Linking color: temp/real: ${tempOrRealColorId} -> ${realColorId}`)
              console.log(`ColorIdMap keys:`, Object.keys(colorIdMap))
              
              try {
                const sizeColorRelation = await prisma.productSizeColor.create({
                  data: {
                    sizeId: createdOrUpdatedSizeId,
                    colorId: realColorId,
                  },
                })
                console.log(`✅ Color ${realColorId} linked to size ${sizeData.size}:`, sizeColorRelation)
              } catch (linkError) {
                console.error(`❌ ERROR linking color ${realColorId} to size ${sizeData.size}:`, linkError.message)
                console.error(`Link error details:`, linkError)
                throw linkError
              }
            }
            
            // Verificar que se guardaron las relaciones
            const savedRelations = await prisma.productSizeColor.findMany({
              where: { sizeId: createdOrUpdatedSizeId }
            })
            console.log(`✅ Verified relations for size ${sizeData.size}:`, savedRelations)
          } else {
            // Si no hay colores, eliminar las relaciones existentes
            await prisma.productSizeColor.deleteMany({
              where: { sizeId: createdOrUpdatedSizeId }
            })
            console.log(`No colors for size ${sizeData.size}, cleared existing relationships`)
          }
        }
        
        console.log('Total stock from sizes:', totalStockFromSizes)
        // Usar el stock calculado de las tallas
        updateData.stock = totalStockFromSizes
        
      } catch (sizeError) {
        console.error('ERROR PROCESSING SIZES:', sizeError.message)
        console.error('Size error stack:', sizeError.stack)
        throw sizeError
      }
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        category: true,
        colors: {
          orderBy: { displayOrder: 'asc' },
        },
        images: {
          orderBy: { displayOrder: 'asc' },
        },
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
                  },
                },
              },
            },
          },
        },
      },
    })

    console.log('✅ Product updated successfully')
    console.log('Product colors in response:', product.colors)
    console.log('Product colors count:', product.colors?.length || 0)
    console.log('Product sizes in response:', product.sizes)

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

// ==================== ERROR HANDLING ====================
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

process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})
