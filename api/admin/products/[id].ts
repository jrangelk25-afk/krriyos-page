import type { ApiRequest, ApiResponse } from '../../../types'
const { PrismaClient } = require('@prisma/client')
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const token = authHeader.substring(7)
  if (!verifyToken(token)) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  const { id } = req.query as { id: string }

  try {
    if (req.method === 'GET') {
      console.log('=== GET Product Request ===')
      console.log('Product ID:', id)
      
      // Get the product
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          colors: {
            orderBy: { displayOrder: 'asc' },
            include: {
              images: true,
            },
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
          images: {
            orderBy: { displayOrder: 'asc' },
          },
        },
      })

      if (!product) {
        console.log('Product not found!')
        return res.status(404).json({ error: 'Product not found' })
      }

      // Debug: Check if images property exists
      console.log('Product from Prisma has images property:', 'images' in product)
      console.log('Product images value:', product.images)
      
      // Fallback: If images are not included, fetch them separately
      if (!product.images || product.images === undefined) {
        console.log('WARNING: Images not included, fetching separately...')
        const images = await prisma.productImage.findMany({
          where: { productId: id },
          orderBy: { displayOrder: 'asc' }
        })
        console.log('Images fetched separately:', images)
        // Add images to product
        ;(product as any).images = images
      }
      
      console.log('Final product has images:', 'images' in product)
      console.log('Final images count:', (product as any).images?.length || 0)
      
      return res.status(200).json(product)
    }

    if (req.method === 'PUT') {
      console.log('=== PUT REQUEST RECEIVED ===')
      console.log('Product ID:', id)
      console.log('Full body:', JSON.stringify(req.body, null, 2))
      
      const { name, description, price, categoryId, sku, stock, discountPercentage, isNewArrival, isOutlet, isActive, image, images, sizes, colors } = req.body

      console.log('Destructured values:')
      console.log('- name:', name)
      console.log('- discountPercentage:', discountPercentage)
      console.log('- colors exists:', !!colors)
      console.log('- colors is array:', Array.isArray(colors))
      console.log('- colors length:', colors?.length)
      console.log('- colors value:', JSON.stringify(colors, null, 2))
      console.log('- sizes exists:', !!sizes)
      console.log('- sizes is array:', Array.isArray(sizes))
      console.log('- sizes length:', sizes?.length)
      console.log('- sizes value:', JSON.stringify(sizes, null, 2))

      const updateData: any = {}
      
      if (name) updateData.name = name
      if (description) updateData.description = description
      if (price) updateData.price = parseFloat(price)
      if (categoryId) updateData.categoryId = categoryId
      if (sku) updateData.sku = sku
      if (stock !== undefined) updateData.stock = parseInt(stock)
      if (discountPercentage !== undefined) {
        updateData.discountPercentage = parseInt(discountPercentage)
      }
      
      // Handle boolean values - they may come as strings or booleans
      if (isNewArrival !== undefined) {
        updateData.isNewArrival = typeof isNewArrival === 'string' ? isNewArrival === 'true' : isNewArrival
      }
      if (isOutlet !== undefined) {
        updateData.isOutlet = typeof isOutlet === 'string' ? isOutlet === 'true' : isOutlet
      }
      if (isActive !== undefined) {
        updateData.isActive = typeof isActive === 'string' ? isActive === 'true' : isActive
      }

      console.log('Update payload received:', req.body)
      console.log('Update data to be saved:', updateData)
      console.log('====== CRITICAL: discountPercentage in updateData:', updateData.discountPercentage, '======')

      // Manejar imágenes múltiples
      if (images && Array.isArray(images) && images.length > 0) {
        // Primero obtener el producto para manejar las imágenes existentes
        const existingProduct = await prisma.product.findUnique({
          where: { id },
          include: { images: true },
        })

        // Eliminar imágenes que ya no existen
        const existingImageIds = new Set(images.filter((img: any) => img.id && !img.id.startsWith('new-')).map((img: any) => img.id))
        const imagesToDelete = existingProduct?.images.filter((img: any) => !existingImageIds.has(img.id)) || []

        if (imagesToDelete.length > 0) {
          await prisma.productImage.deleteMany({
            where: { id: { in: imagesToDelete.map((img: { id: any }) => img.id) } },
          })
        }

        // Crear/actualizar imágenes
        updateData.images = {
          deleteMany: { productId: id },
          create: images.map((img: any, index: number) => ({
            imageUrl: img.imageUrl,
            displayOrder: index,
            isPrimary: index === 0,
            altText: name || `Product image ${index + 1}`,
          })),
        }
      } else if (image) {
        // Modo legado: si solo hay una imagen
        const existingProduct = await prisma.product.findUnique({
          where: { id },
          include: { images: true },
        })

        if (existingProduct?.images.length) {
          await prisma.productImage.deleteMany({
            where: { productId: id },
          })
        }

        updateData.images = {
          create: {
            imageUrl: image,
            isPrimary: true,
            altText: name || 'Product image',
          },
        }
      }

      // IMPORTANT: Procesar tallas ANTES de actualizar el producto
      // porque las tallas se crean de forma independiente
      let totalStockFromSizes = 0
      
      // Primero procesar COLORES y MAPEAR IDs TEMPORALES A IDs REALES
      const colorIdMap: any = {} // Mapeo de IDs temporales 'new-xxx' a IDs reales
      
      if (colors && Array.isArray(colors) && colors.length > 0) {
        console.log('Processing colors:', JSON.stringify(colors, null, 2))
        
        // Obtener colores existentes del producto
        const existingProduct = await prisma.product.findUnique({
          where: { id },
          include: { colors: true },
        })

        if (!existingProduct) {
          throw new Error(`Product with id ${id} not found during color processing`)
        }

        // IDs de colores que se mantienen (excluyendo los nuevos que empiezan con 'new-')
        const incomingColorIds = new Set(colors.filter((c: any) => c.id && !c.id.startsWith('new-')).map((c: any) => c.id))
        
        // Eliminar colores que ya no existen
        const colorsToDelete = existingProduct.colors.filter((c: any) => !incomingColorIds.has(c.id)) || []
        if (colorsToDelete.length > 0) {
          console.log('Deleting colors:', colorsToDelete)
          await prisma.productColor.deleteMany({
            where: { id: { in: colorsToDelete.map((c: any) => c.id) } },
          })
          console.log(`Deleted ${colorsToDelete.length} colors`)
        }

        // Crear/actualizar colores
        for (const colorData of colors) {
          console.log(`Processing color: id=${colorData.id}, starts with new-? ${colorData.id.startsWith('new-')}`)
          
          if (colorData.id.startsWith('new-')) {
            // Nuevo color
            console.log(`Creating new color: ${colorData.name} (${colorData.hexCode})`)
            try {
              const createdColor = await prisma.productColor.create({
                data: {
                  productId: id,
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
            } catch (createColorError: any) {
              console.error('❌ ERROR creating color:', createColorError.message)
              throw createColorError
            }
          } else {
            // Actualizar color existente
            console.log(`Updating existing color: ${colorData.id}`)
            try {
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
            } catch (updateColorError: any) {
              console.error('❌ ERROR updating color:', updateColorError.message)
              throw updateColorError
            }
          }
        }
        console.log('✅ All colors processed successfully')
        console.log('Color ID Map:', colorIdMap)
      } else {
        console.log('No colors to process. colors:', colors)
      }
      
      if (sizes && Array.isArray(sizes) && sizes.length > 0) {
        console.log('Processing sizes:', JSON.stringify(sizes, null, 2))
        
        try {
          // Obtener tallas existentes
          const existingProduct = await prisma.product.findUnique({
            where: { id },
            include: { sizes: true },
          })

          if (!existingProduct) {
            throw new Error(`Product with id ${id} not found`)
          }

          // IDs de tallas que se mantienen
          const incomingSizeIds = new Set(sizes.filter((s: any) => s.id && !s.id.startsWith('new-')).map((s: any) => s.id))
          
          // Eliminar tallas que ya no existen
          const sizesToDelete = existingProduct.sizes.filter((s: any) => !incomingSizeIds.has(s.id)) || []
          if (sizesToDelete.length > 0) {
            console.log('Deleting sizes:', sizesToDelete)
            await prisma.productSize.deleteMany({
              where: { id: { in: sizesToDelete.map((s: any) => s.id) } },
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
                  productId: id,
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
              const updatedSize = await prisma.productSize.update({
                where: { id: sizeData.id },
                data: {
                  stock: parsedStock,
                },
              })
              console.log('Size updated successfully:', updatedSize)
              createdOrUpdatedSizeId = updatedSize.id
              totalStockFromSizes += parsedStock
            }

            // Procesar colores de la talla
            if (sizeData.colorIds && Array.isArray(sizeData.colorIds) && sizeData.colorIds.length > 0) {
              console.log(`Processing colors for size ${sizeData.size}:`, sizeData.colorIds)

              // Eliminar relaciones existentes de esta talla
              await prisma.productSizeColor.deleteMany({
                where: { sizeId: createdOrUpdatedSizeId }
              })

              // Crear nuevas relaciones para cada color
              for (const tempOrRealColorId of sizeData.colorIds) {
                // Si el colorId es temporal (new-xxx), usar el ID real mapeado
                const realColorId = colorIdMap[tempOrRealColorId] || tempOrRealColorId
                console.log(`Linking color: temp/real: ${tempOrRealColorId} -> ${realColorId}`)
                
                try {
                  await prisma.productSizeColor.create({
                    data: {
                      sizeId: createdOrUpdatedSizeId,
                      colorId: realColorId,
                    },
                  })
                  console.log(`✅ Color ${realColorId} linked to size ${sizeData.size}`)
                } catch (linkError: any) {
                  console.error(`❌ ERROR linking color ${realColorId} to size ${sizeData.size}:`, linkError.message)
                  throw linkError
                }
              }
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
          
        } catch (sizeError: any) {
          console.error('ERROR PROCESSING SIZES:', sizeError.message)
          console.error('Size error stack:', sizeError.stack)
          throw sizeError
        }
      }

      console.log('Final updateData before product update:', updateData)

      // Ahora actualizar el producto
      console.log('🔴 ABOUT TO UPDATE PRODUCT WITH DATA:', JSON.stringify(updateData, null, 2))
      const product = await prisma.product.update({
        where: { id },
        data: updateData,
        include: {
          category: true,
          colors: {
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
          images: {
            orderBy: { displayOrder: 'asc' },
          },
        },
      })

      console.log('Product updated successfully')
      console.log('🔴 PRODUCT RESPONSE discountPercentage:', product.discountPercentage)
      console.log('Product colors in response:', product.colors)
      console.log('Product colors count:', product.colors?.length || 0)
      console.log('Product sizes in response:', product.sizes)
      console.log('FULL RESPONSE ABOUT TO SEND:', JSON.stringify(product, null, 2))

      return res.status(200).json(product)
    }

    if (req.method === 'DELETE') {
      await prisma.product.delete({
        where: { id },
      })

      return res.status(200).json({ message: 'Product deleted' })
    }
  } catch (error: any) {
    console.error('=== FULL ERROR IN PRODUCT UPDATE ===')
    console.error('Error message:', error.message)
    console.error('Error code:', error.code)
    console.error('Error stack:', error.stack)
    console.error('Full error:', error)
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' })
    }

    return res.status(500).json({ error: 'Internal server error', details: error.message })
  } finally {
    await prisma.$disconnect()
  }
}
