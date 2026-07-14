import type { ApiRequest, ApiResponse } from '../../types'
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

export default async function handler(
  req: ApiRequest,
  res: ApiResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { id } = req.query

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required',
      })
    }

    const product = await prisma.product.findFirst({
      where: {
        AND: [
          { id: id as string },
          { isActive: true },
        ],
      },
      include: {
        category: true,
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        colors: {
          orderBy: { displayOrder: 'asc' },
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
      product.sizes.map(async (size: any) => {
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

        console.log(`DEBUG [size ${size.size}]: encontrados ${sizeColors.length} colores en product_size_colors`)
        sizeColors.forEach((sc: any) => console.log(`  - ${sc.color.name}`))

        // Map to colors
        const availableColors = sizeColors
          .map((mapping: any) => ({
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

    // Return product with enriched sizes
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
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  } finally {
    await prisma.$disconnect()
  }
}
