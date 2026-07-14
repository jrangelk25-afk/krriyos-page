import type { ApiRequest, ApiResponse } from '../../types'
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
  res.setHeader('Access-Control-Allow-Methods', 'GET,PATCH,OPTIONS')
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
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      })

      if (!order) {
        return res.status(404).json({ error: 'Order not found' })
      }

      return res.status(200).json(order)
    }

    if (req.method === 'PATCH') {
      const { status, notes } = req.body

      const order = await prisma.order.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(notes && { notes }),
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      })

      return res.status(200).json(order)
    }
  } catch (error: any) {
    console.error('Order error:', error)

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Order not found' })
    }

    return res.status(500).json({ error: 'Internal server error' })
  } finally {
    await prisma.$disconnect()
  }
}
