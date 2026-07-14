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
    const { categoryId, isOutlet, isNew } = req.query

    let where: any = { isActive: true }

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
        sizes: {
          orderBy: { id: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Fetch ALL size-color mappings in one query
    const allSizeColorMappings = await prisma.productSizeColor.findMany({
      where: {
        color: {
          product: {
            id: { in: products.map(p => p.id) }
          }
        }
      },
      include: {
        color: true,
      },
    })

    // Create Map for fast lookup
    const sizeColorMap = new Map<string, any[]>()
    allSizeColorMappings.forEach(mapping => {
      const key = mapping.sizeId
      if (!sizeColorMap.has(key)) {
        sizeColorMap.set(key, [])
      }
      sizeColorMap.get(key)!.push(mapping)
    })

    // Enrich products in-memory (no queries)
    const enrichedProducts = products.map((product: any) => ({
      ...product,
      sizes: product.sizes.map((size: any) => ({
        ...size,
        availableColors: (sizeColorMap.get(size.id) || [])
          .map((mapping: any) => ({
            id: mapping.color.id,
            name: mapping.color.name,
            hexCode: mapping.color.hexCode,
          }))
      }))
    }))

    return res.status(200).json({
      success: true,
      data: enrichedProducts,
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error details:', errorMessage)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      details: errorMessage
    })
  } finally {
    await prisma.$disconnect()
  }
}
