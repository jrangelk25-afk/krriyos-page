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

  const { id } = req.query as { id: string }

  try {
    if (req.method === 'GET') {
      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          products: true,
        },
      })

      if (!category) {
        return res.status(404).json({ error: 'Category not found' })
      }

      return res.status(200).json(category)
    }

    if (req.method === 'PUT') {
      const { name, description, slug, displayOrder, isActive } = req.body

      const category = await prisma.category.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description && { description }),
          ...(slug && { slug }),
          ...(displayOrder !== undefined && { displayOrder }),
          ...(isActive !== undefined && { isActive }),
        },
      })

      return res.status(200).json(category)
    }

    if (req.method === 'DELETE') {
      await prisma.category.delete({
        where: { id },
      })

      return res.status(200).json({ message: 'Category deleted' })
    }
  } catch (error: any) {
    console.error('Category error:', error)

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Category not found' })
    }

    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Name or slug already exists' })
    }

    return res.status(500).json({ error: 'Internal server error' })
  } finally {
    await prisma.$disconnect()
  }
}
