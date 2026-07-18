// Script de prueba con productos reales
const testOrder = async () => {
  // Primero, obtenemos los productos
  try {
    const productsRes = await fetch('http://localhost:3000/api/public/products?limit=1')
    const productsData = await productsRes.json()

    console.log('Products response:', JSON.stringify(productsData, null, 2))

    if (!productsData.success || !productsData.data || productsData.data.length === 0) {
      console.error('❌ No products found in the database')
      return
    }

    const product = productsData.data[0]
    console.log('\n✓ Usando producto:', product.name || product.sku, '(ID:', product.id, ')')

    const orderData = {
      orderNumber: `KRR-${Date.now()}`,
      fullName: 'Juan Pérez',
      email: `test-${Date.now()}@example.com`,
      phone: '+57 3001234567',
      country: 'Colombia',
      city: 'Bogotá',
      address: 'Calle 123 Apto 456',
      items: [
        {
          productId: product.id,
          size: '36',
          quantity: 1,
          unitPrice: product.price || product.precio || 99.99,
        }
      ],
      subtotal: product.price || product.precio || 99.99,
      total: product.price || product.precio || 99.99,
    }

    console.log('\n📤 Enviando orden de prueba:')
    console.log(JSON.stringify(orderData, null, 2))

    const response = await fetch('http://localhost:3000/api/public/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })

    const result = await response.json()

    console.log('\n📥 Respuesta del servidor (Status:', response.status + '):')
    console.log(JSON.stringify(result, null, 2))

    if (result.success) {
      console.log('\n✅ Orden creada exitosamente!')
      console.log('ID de orden:', result.data.id)
      console.log('Número de orden:', result.data.orderNumber)
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testOrder()
