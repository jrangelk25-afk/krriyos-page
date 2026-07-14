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
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS')
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

  const { sizeId } = req.query as { sizeId: string }

  try {
    if (req.method === 'PUT') {
      // Actualizar stock de una talla
      const { stock } = req.body

      if (stock === undefined) {
        return res.status(400).json({ error: 'Stock is required' })
      }

      const updatedSize = await prisma.productSize.update({
        where: { id: sizeId },
        data: { stock: parseInt(stock) },
        include: {
          color: true,
        },
      })

      return res.status(200).json(updatedSize)
    }

    if (req.method === 'DELETE') {
      // Eliminar una talla
      await prisma.productSize.delete({
        where: { id: sizeId },
      })

      return res.status(200).json({ message: 'Size deleted' })
    }
  } catch (error: any) {
    console.error('Size management error:', error)

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Size not found' })
    }

    return res.status(500).json({ error: 'Internal server error' })
  } finally {
    await prisma.$disconnect()
  }
}
