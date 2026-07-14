import type { ApiRequest, ApiResponse } from '../types'
const { PrismaClient } = require('@prisma/client')
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

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
  const decoded = verifyToken(token)
  
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  // Solo ADMIN puede crear o listar usuarios
  if (decoded.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  try {
    if (req.method === 'GET') {
      const adminUsers = await prisma.adminUser.findMany({
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      return res.status(200).json(adminUsers)
    }

    if (req.method === 'POST') {
      const { email, fullName, password, role } = req.body

      if (!email || !fullName || !password) {
        return res.status(400).json({ error: 'Email, name and password are required' })
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' })
      }

      const passwordHash = await bcrypt.hash(password, 10)

      const adminUser = await prisma.adminUser.create({
        data: {
          email,
          fullName,
          passwordHash,
          role: role || 'STAFF',
          isActive: true,
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

      return res.status(201).json(adminUser)
    }
  } catch (error: any) {
    console.error('Admin users error:', error)

    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Email already exists' })
    }

    return res.status(500).json({ error: 'Internal server error' })
  } finally {
    await prisma.$disconnect()
  }
}
