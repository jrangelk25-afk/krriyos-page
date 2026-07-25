import type { ApiRequest, ApiResponse } from '../types'
import { getPrisma } from '../../lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Caching simple para dashboard (5 minutos)
let cachedDashboardData: any = null
let lastDashboardUpdate = 0
const DASHBOARD_CACHE_TTL = 5 * 60 * 1000 // 5 minutos

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

    const prisma = getPrisma()

    // Verificar si hay datos en cache
    const now = Date.now()
    if (cachedDashboardData && (now - lastDashboardUpdate) < DASHBOARD_CACHE_TTL) {
      console.log('✓ Dashboard data from cache (age: ' + (now - lastDashboardUpdate) + 'ms)')
      return res.status(200).json(cachedDashboardData)
    }

    // Paralelizar todas las queries usando Promise.all para máximo performance
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const [totalOrders, totalCustomers, totalProducts, orderStats, recentOrders, lowStockProducts, ordersByMonth] = await Promise.all([
      prisma.order.count(),
      prisma.customer.count(),
      prisma.product.count(),
      prisma.order.aggregate({
        _sum: { total: true },
      }),
      prisma.order.findMany({
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
      }),
      prisma.product.findMany({
        where: {
          stock: {
            lte: 5,
          },
        },
        take: 5,
        orderBy: { stock: 'asc' },
      }),
      prisma.order.groupBy({
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
      }),
    ])

    // Construir respuesta
    const dashboardData = {
      stats: {
        totalOrders,
        totalCustomers,
        totalProducts,
        totalRevenue: orderStats._sum.total || 0,
      },
      recentOrders,
      lowStockProducts,
      salesByMonth: ordersByMonth,
    }

    // Guardar en cache
    cachedDashboardData = dashboardData
    lastDashboardUpdate = now

    return res.status(200).json(dashboardData)
  } catch (error) {
    console.error('Dashboard error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
