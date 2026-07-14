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
  } finally {
    await prisma.$disconnect()
  }
}
