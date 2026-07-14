import type { ApiRequest, ApiResponse } from '../types'
const { PrismaClient } = require('@prisma/client')
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Middleware para verificar token
const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch {
    return null
  }
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Verificar autenticación
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
  } finally {
    await prisma.$disconnect()
  }
}
