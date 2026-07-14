import type { ApiRequest, ApiResponse } from '../../../../types';
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
 * PATCH /api/admin/products/[id]/inventory/[sizeId]
 * Update stock for a specific size-color combination
 */
async function handlePatch(req: ApiRequest, res: ApiResponse) {
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

    const { id, sizeId } = req.query;
    const { stock } = req.body;

    if (!id || typeof id !== 'string' || !sizeId || typeof sizeId !== 'string') {
      return res.status(400).json({ error: 'Product ID and Size ID are required' });
    }

    if (stock === undefined) {
      return res.status(400).json({ error: 'Stock is required' });
    }

    if (stock < 0) {
      return res.status(400).json({ error: 'Stock cannot be negative' });
    }

    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Find and update the size
    const updatedSize = await prisma.productSize.update({
      where: { id: sizeId },
      data: { stock: parseInt(stock) },
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

    // Verify it belongs to this product
    if (updatedSize.productId !== id) {
      return res.status(403).json({ error: 'Size does not belong to this product' });
    }

    return res.status(200).json(updatedSize);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Size not found' });
    }
    console.error('Error updating product size:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * DELETE /api/admin/products/[id]/inventory/[sizeId]
 * Delete a specific size-color combination
 */
async function handleDelete(req: ApiRequest, res: ApiResponse) {
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

    const { id, sizeId } = req.query;

    if (!id || typeof id !== 'string' || !sizeId || typeof sizeId !== 'string') {
      return res.status(400).json({ error: 'Product ID and Size ID are required' });
    }

    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Find the size
    const size = await prisma.productSize.findUnique({ where: { id: sizeId } });
    if (!size || size.productId !== id) {
      return res.status(404).json({ error: 'Size not found or does not belong to this product' });
    }

    // Delete the size
    await prisma.productSize.delete({
      where: { id: sizeId }
    });

    return res.status(200).json({ message: 'Size deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Size not found' });
    }
    console.error('Error deleting product size:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method === 'PATCH') {
    return handlePatch(req, res);
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
