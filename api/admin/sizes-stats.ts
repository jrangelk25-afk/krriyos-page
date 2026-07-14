import type { ApiRequest, ApiResponse } from '../types'
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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const token = authHeader.substring(7)
  if (!verifyToken(token)) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  try {
    // Obtener total de tallas
    const totalSizes = await prisma.productSize.count()

    // Obtener productos con y sin tallas
    const productsWithSizes = await prisma.product.count({
      where: {
        sizes: {
          some: {}
        }
      }
    })

    const productsWithoutSizes = await prisma.product.count({
      where: {
        sizes: {
          none: {}
        }
      }
    })

    // Obtener resumen de stock por talla y color
    const sizeStats = await prisma.productSize.groupBy({
      by: ['size', 'colorId'],
      _sum: {
        stock: true,
      },
      _count: {
        productId: true,
      },
    })

    // Enriquecer con nombres de colores
    const enrichedStats = await Promise.all(
      sizeStats.map(async (stat) => {
        let colorName = null
        if (stat.colorId) {
          const color = await prisma.productColor.findUnique({
            where: { id: stat.colorId },
            select: { name: true }
          })
          colorName = color?.name
        }

        return {
          size: stat.size,
          color: colorName,
          totalStock: stat._sum.stock || 0,
          productCount: stat._count.productId,
        }
      })
    )

    // Ordenar por talla
    enrichedStats.sort((a, b) => {
      const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
      const aIndex = sizeOrder.indexOf(a.size)
      const bIndex = sizeOrder.indexOf(b.size)
      return aIndex - bIndex
    })

    return res.status(200).json({
      totalSizes,
      productsWithSizes,
      productsWithoutSizes,
      totalStockBySizeAndColor: enrichedStats,
    })
  } catch (error) {
    console.error('Sizes stats error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  } finally {
    await prisma.$disconnect()
  }
}
