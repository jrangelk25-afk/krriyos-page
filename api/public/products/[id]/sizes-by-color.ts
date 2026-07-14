import type { ApiRequest, ApiResponse } from '../../types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/public/products/[id]/sizes-by-color?colorId=abc-123
 * Returns all sizes available for a product
 * (ColorId is now for reference only, sizes are independent)
 */
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { colorId } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Verify product exists and is active
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, isActive: true }
    });

    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // If colorId is provided, verify it exists
    if (colorId && typeof colorId === 'string') {
      const color = await prisma.productColor.findUnique({
        where: { id: colorId },
        select: {
          id: true,
          productId: true,
          name: true,
          hexCode: true,
          isActive: true
        }
      });

      if (!color || color.productId !== id) {
        return res.status(404).json({ error: 'Color not found for this product' });
      }
    }

    // Get all sizes for this product (no color filtering)
    const sizes = await prisma.productSize.findMany({
      where: {
        productId: id,
      },
      select: {
        size: true,
        stock: true
      },
      orderBy: {
        size: 'asc'
      }
    });

    if (sizes.length === 0) {
      return res.status(404).json({
        error: `No sizes found for this product`,
        productId: id,
        sizes: []
      });
    }

    // Transform to return size info with stock
    const sizeData = sizes.map(ps => ({
      size: ps.size,
      stock: ps.stock,
      isAvailable: ps.stock > 0
    }));

    return res.status(200).json({
      productId: id,
      colorId: colorId || null,
      sizes: sizeData,
      availableCount: sizeData.filter(s => s.isAvailable).length
    });
  } catch (error) {
    console.error('Error fetching sizes:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
