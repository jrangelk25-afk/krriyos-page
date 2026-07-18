// Script de prueba para el endpoint de órdenes
const testOrder = async () => {
  const orderData = {
    orderNumber: `KRR-${Date.now()}`,
    fullName: 'Test Usuario',
    email: 'test@example.com',
    phone: '+57 3001234567',
    country: 'Colombia',
    city: 'Bogotá',
    address: 'Calle 123 Apto 456',
    items: [
      {
        productId: '550e8400-e29b-41d4-a716-446655440000', // ID de prueba
        size: '36',
        quantity: 2,
        unitPrice: 99.99,
      }
    ],
    subtotal: 199.98,
    total: 199.98,
  }

  console.log('📤 Enviando orden de prueba:')
  console.log(JSON.stringify(orderData, null, 2))

  try {
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
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testOrder()
