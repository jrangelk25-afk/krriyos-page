import type { ApiRequest, ApiResponse } from '../types'
import { getPrisma } from '../../lib/prisma'
import { getCachedOrFetch } from '../../lib/cache'

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
    const { categoryId, isOutlet, isNew, page = '1', limit = '20' } = req.query

    const pageNum = Math.max(1, parseInt(String(page)) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit)) || 20))
    const skip = (pageNum - 1) * limitNum

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

    // Create cache key based on filters
    const cacheKey = `products:${JSON.stringify({categoryId, isOutlet, isNew, pageNum, limitNum})}`
    const PRODUCTS_CACHE_TTL = 60 * 60 // 1 hour

    // Try to get from cache
    const cached = await getCachedOrFetch(
      cacheKey,
      async () => {
        const [products, total] = await Promise.all([
          prisma.product.findMany({
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
            skip,
            take: limitNum,
          }),
          prisma.product.count({ where })
        ])

        // Fetch ALL size-color mappings for these products in one query
        const productIds = products.map((p: any) => p.id)
        const allSizeColorMappings = await prisma.productSizeColor.findMany({
          where: {
            size: {
              productId: { in: productIds }
            }
          },
          include: {
            color: true,
          },
        })

        // Create Map for fast lookup
        const sizeColorMap = new Map<string, any[]>()
        allSizeColorMappings.forEach((mapping: any) => {
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

        return {
          products: enrichedProducts,
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      },
      PRODUCTS_CACHE_TTL
    )

    return res.status(200).json({
      success: true,
      data: cached.products,
      pagination: {
        total: cached.total,
        page: cached.page,
        limit: cached.limit,
        pages: cached.pages
      }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      details: errorMessage
    })
  }
}
