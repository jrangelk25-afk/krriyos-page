import type { ApiRequest, ApiResponse } from '../../../../types'
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
  const decoded = verifyToken(token)

  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  // Solo ADMIN puede modificar usuarios
  if (decoded.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const { id } = req.query as { id: string }

  try {
    if (req.method === 'GET') {
      const adminUser = await prisma.adminUser.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
        },
      })

      if (!adminUser) {
        return res.status(404).json({ error: 'Admin user not found' })
      }

      return res.status(200).json(adminUser)
    }

    if (req.method === 'PUT') {
      const { fullName, role, isActive } = req.body

      const adminUser = await prisma.adminUser.update({
        where: { id },
        data: {
          ...(fullName && { fullName }),
          ...(role && { role }),
          ...(isActive !== undefined && { isActive }),
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      })

      return res.status(200).json(adminUser)
    }

    if (req.method === 'DELETE') {
      await prisma.adminUser.delete({
        where: { id },
      })

      return res.status(200).json({ message: 'Admin user deleted' })
    }
  } catch (error: any) {
    console.error('Admin user error:', error)

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Admin user not found' })
    }

    return res.status(500).json({ error: 'Internal server error' })
  } finally {
    await prisma.$disconnect()
  }
}
