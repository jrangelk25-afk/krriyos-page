import type { ApiRequest, ApiResponse } from '../../types'
import { getPrisma } from '../../../lib/prisma'

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
    const prisma = getPrisma()
    const { id } = req.query

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required',
      })
    }

    // QUERY 1: Get product with basic data (NO nested includes para evitar N+1)
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

    // QUERY 2: Batch fetch ALL size-color mappings en UNA sola query
    const sizeIds = product.sizes.map((s: any) => s.id)
    const sizeColorMappings = await prisma.productSizeColor.findMany({
      where: {
        sizeId: { in: sizeIds }, // ✅ Todos en una query
      },
      include: {
        color: {
          select: {
            id: true,
            name: true,
            hexCode: true,
          },
        },
      },
    })

    // Enrich sizes con los colores (EN MEMORIA, sin queries adicionales)
    const enrichedSizes = product.sizes.map((size: any) => {
      const availableColors = sizeColorMappings
        .filter((mapping: any) => mapping.sizeId === size.id) // ✅ Filter en memoria
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
  }
}
