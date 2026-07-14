import type { ApiRequest, ApiResponse } from '../../../types'
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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
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

  const { productId } = req.query as { productId: string }

  try {
    if (req.method === 'GET') {
      // Obtener todas las tallas de un producto
      const sizes = await prisma.productSize.findMany({
        where: { productId },
        include: {
          color: true,
        },
        orderBy: { createdAt: 'asc' },
      })

      return res.status(200).json(sizes)
    }

    if (req.method === 'POST') {
      // Crear nueva talla
      const { size, colorId, stock } = req.body

      if (!size || stock === undefined) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      // Validar que no exista la misma talla-color
      const existingSize = await prisma.productSize.findUnique({
        where: {
          productId_size_colorId: {
            productId,
            size,
            colorId: colorId || null,
          },
        },
      })

      if (existingSize) {
        return res.status(400).json({ error: 'This size-color combination already exists' })
      }

      const newSize = await prisma.productSize.create({
        data: {
          productId,
          size,
          colorId: colorId || null,
          stock: parseInt(stock),
        },
        include: {
          color: true,
        },
      })

      return res.status(201).json(newSize)
    }
  } catch (error: any) {
    console.error('Size management error:', error)

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Size not found' })
    }

    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'This size-color combination already exists' })
    }

    return res.status(500).json({ error: 'Internal server error' })
  } finally {
    await prisma.$disconnect()
  }
}
