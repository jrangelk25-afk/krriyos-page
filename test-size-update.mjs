import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'tu-llave-secreta-super-segura-cambiar-en-produccion';

async function main() {
  try {
    // 1. Obtener un producto para prueba
    console.log('=== BUSCANDO PRODUCTO ===');
    const product = await prisma.product.findFirst({
      include: { sizes: true }
    });
    
    if (!product) {
      console.log('No hay productos en la BD');
      return;
    }
    
    console.log('Producto encontrado:', product.id, product.name);
    console.log('Tallas actuales:', product.sizes);

    // 2. Crear talla de prueba directamente
    console.log('\n=== CREANDO TALLA DE PRUEBA ===');
    const newSize = await prisma.productSize.create({
      data: {
        productId: product.id,
        size: '35',
        colorId: null,
        stock: 10,
      },
    });
    console.log('Talla creada:', newSize);

    // 3. Verificar que se guardó
    console.log('\n=== VERIFICANDO TALLA GUARDADA ===');
    const updatedProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: { sizes: true },
    });
    console.log('Tallas después de crear:', updatedProduct.sizes);

    // 4. Simular la lógica del endpoint
    console.log('\n=== SIMULANDO LÓGICA DEL ENDPOINT ===');
    const sizesPayload = [
      {
        id: `new-${Date.now()}-36`,
        size: '36',
        colorId: null,
        stock: 15,
      },
      {
        id: newSize.id,
        size: '35',
        colorId: null,
        stock: 20,
      },
    ];
    
    console.log('Payload de tallas:', JSON.stringify(sizesPayload, null, 2));

    // Simular lógica del endpoint
    const incomingSizeIds = new Set(
      sizesPayload.filter((s) => s.id && !s.id.startsWith('new-')).map((s) => s.id)
    );
    
    const sizesToDelete = updatedProduct.sizes.filter((s) => !incomingSizeIds.has(s.id));
    console.log('Tallas a eliminar:', sizesToDelete);

    // Procesar tallas
    for (const sizeData of sizesPayload) {
      if (sizeData.id.startsWith('new-')) {
        console.log(`Creando nueva talla: ${sizeData.size}`);
        const created = await prisma.productSize.create({
          data: {
            productId: product.id,
            size: sizeData.size,
            colorId: sizeData.colorId || null,
            stock: sizeData.stock,
          },
        });
        console.log('Creada:', created);
      } else {
        console.log(`Actualizando talla existente: ${sizeData.id}`);
        const updated = await prisma.productSize.update({
          where: { id: sizeData.id },
          data: { stock: sizeData.stock },
        });
        console.log('Actualizada:', updated);
      }
    }

    // 5. Resultado final
    console.log('\n=== RESULTADO FINAL ===');
    const finalProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: { sizes: true },
    });
    console.log('Tallas finales:', finalProduct.sizes);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
