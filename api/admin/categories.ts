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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
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

  try {
    if (req.method === 'GET') {
      const categories = await prisma.category.findMany({
        orderBy: { displayOrder: 'asc' },
      })
      return res.status(200).json(categories)
    }

    if (req.method === 'POST') {
      const { name, description, slug, displayOrder, isActive } = req.body

      if (!name || !slug) {
        return res.status(400).json({ error: 'Name and slug are required' })
      }

      const category = await prisma.category.create({
        data: {
          name,
          description,
          slug,
          displayOrder: displayOrder || 0,
          isActive: isActive !== false,
        },
      })

      return res.status(201).json(category)
    }
  } catch (error: any) {
    console.error('Categories error:', error)

    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Name or slug already exists' })
    }

    return res.status(500).json({ error: 'Internal server error' })
  } finally {
    await prisma.$disconnect()
  }
}
