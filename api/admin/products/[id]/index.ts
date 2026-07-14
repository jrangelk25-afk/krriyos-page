import type { ApiRequest, ApiResponse } from '../../../types';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  } catch {
    return null;
  }
};

/**
 * GET /api/admin/products/[id]
 * Returns product details with inventory
 */
async function handleGet(req: ApiRequest, res: ApiResponse) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        colors: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            hexCode: true,
            displayOrder: true
          },
          orderBy: { displayOrder: 'asc' }
        },
        sizes: {
          include: {
            color: {
              select: {
                id: true,
                name: true,
                hexCode: true
              }
            }
          },
          orderBy: [{ size: 'asc' }, { color: { displayOrder: 'asc' } }]
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const totalStock = product.sizes.reduce((sum, size) => sum + size.stock, 0);
    const availableVariants = product.sizes.filter(s => s.stock > 0).length;

    return res.status(200).json({
      productId: id,
      productName: product.name,
      colors: product.colors,
      sizes: product.sizes,
      stats: {
        totalStock,
        totalVariants: product.sizes.length,
        availableVariants,
        uniqueSizes: [...new Set(product.sizes.map(s => s.size))],
        uniqueColors: product.colors.length
      }
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/admin/products/[id]
 * Add a new color-size combination
 */
async function handlePost(req: ApiRequest, res: ApiResponse) {
  try {
    const auth = req.headers.authorization;
    if (!auth) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = auth.replace('Bearer ', '');
    const user = verifyToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { id } = req.query;
    const { colorId, size, stock } = req.body;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    if (!colorId || !size || stock === undefined) {
      return res.status(400).json({ error: 'colorId, size, and stock are required' });
    }

    if (stock < 0) {
      return res.status(400).json({ error: 'Stock cannot be negative' });
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const color = await prisma.productColor.findUnique({ where: { id: colorId } });
    if (!color || color.productId !== id) {
      return res.status(404).json({ error: 'Color not found for this product' });
    }

    const existing = await prisma.productSize.findUnique({
      where: {
        productId_size_colorId: {
          productId: id,
          size: size.toUpperCase(),
          colorId
        }
      }
    });

    if (existing) {
      return res.status(409).json({ error: 'This size-color combination already exists' });
    }

    const newSize = await prisma.productSize.create({
      data: {
        productId: id,
        colorId,
        size: size.toUpperCase(),
        stock: parseInt(stock)
      },
      include: {
        color: {
          select: {
            id: true,
            name: true,
            hexCode: true
          }
        }
      }
    });

    return res.status(201).json(newSize);
  } catch (error) {
    console.error('Error creating product size:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
