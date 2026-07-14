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
      const products = await prisma.product.findMany({
        include: {
          category: true,
          colors: true,
          images: true,
          sizes: {
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
      return res.status(200).json(products)
    }

    if (req.method === 'POST') {
      const { name, description, price, categoryId, sku, stock, isNewArrival, isOutlet, image } = req.body

      if (!name || !price || !categoryId || !sku) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      // Convert boolean values correctly in case they come as strings
      const parseBoolean = (value: any): boolean => {
        if (typeof value === 'string') return value === 'true'
        return !!value
      }

      console.log('Create product payload:', req.body)

      const product = await prisma.product.create({
        data: {
          name,
          description,
          price: parseFloat(price),
          categoryId,
          sku,
          stock: parseInt(stock) || 0,
          isNewArrival: parseBoolean(isNewArrival),
          isOutlet: parseBoolean(isOutlet),
          // Si hay imagen, crearla en la relación ProductImage
          ...(image && {
            images: {
              create: {
                imageUrl: image,
                isPrimary: true,
                altText: name,
              },
            },
          }),
        },
        include: {
          category: true,
          images: true,
        },
      })

      console.log('Product created:', product)
      return res.status(201).json(product)
    }
  } catch (error) {
    console.error('Products error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  } finally {
    await prisma.$disconnect()
  }
}
