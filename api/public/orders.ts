import { PrismaClient } from '@prisma/client'
import type { ApiRequest, ApiResponse } from '../types'

const prisma = new PrismaClient()

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle CORS
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const { orderNumber, fullName, email, phone, country, city, address, items, subtotal, total } = req.body

    // Validation
    if (!orderNumber || !fullName || !email || !phone || !country || !city || !address || !items) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      })
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Order must have at least one item',
      })
    }

    // Find or create customer
    let customer = await prisma.customer.findUnique({
      where: { email },
    })

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          email,
          fullName,
          phone,
        },
      })
    }

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        fullName,
        phone,
        country,
        city,
        address,
        subtotal: subtotal || 0,
        tax: 0,
        total: total || subtotal || 0,
        status: 'PENDING',
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        items: true,
        customer: true,
      },
    })

    return res.status(201).json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
      },
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error creating order',
    })
  } finally {
    await prisma.$disconnect()
  }
}
