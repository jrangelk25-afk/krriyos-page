import type { ApiRequest, ApiResponse } from '../../types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/public/products/[id]/colors-by-size?size=M
 * Returns stock information for a specific product size
 * (Previously returned colors, but now ProductSize is independent)
 */
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { size } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    if (!size || typeof size !== 'string') {
      return res.status(400).json({ error: 'Size parameter is required' });
    }

    // Verify product exists and is active
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, isActive: true }
    });

    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get stock for this size
    const productSize = await prisma.productSize.findUnique({
      where: {
        productId_size: {
          productId: id,
          size: size.toUpperCase(),
        },
      },
    });

    if (!productSize) {
      return res.status(404).json({
        error: `Size ${size} not found for this product`,
        size,
        stock: 0,
        isAvailable: false
      });
    }

    return res.status(200).json({
      size,
      productId: id,
      stock: productSize.stock,
      isAvailable: productSize.stock > 0
    });
  } catch (error) {
    console.error('Error fetching size information:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
