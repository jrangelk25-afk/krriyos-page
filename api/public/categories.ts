import type { ApiRequest, ApiResponse } from '../../types'
import { getPrisma } from '../../../lib/prisma'
import { getCachedOrFetch, deleteCachePattern } from '../../../lib/cache'

const CATEGORIES_CACHE_KEY = 'categories:active'
const CATEGORIES_CACHE_TTL = 24 * 60 * 60 // 24 hours

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
    
    // Try to get from cache first, otherwise fetch from DB
    const categories = await getCachedOrFetch(
      CATEGORIES_CACHE_KEY,
      async () => {
        const data = await prisma.category.findMany({
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        })
        return data
      },
      CATEGORIES_CACHE_TTL
    )

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
}
