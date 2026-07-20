# Sistema de Descuentos Dinámicos para Outlet

## Resumen de Cambios

He implementado un sistema completo y dinámico de descuentos para productos outlet. Ahora los administradores pueden establecer porcentajes de descuento que se mostrarán en toda la plataforma.

## Cambios Realizados

### 1. Base de Datos

#### Migración SQL
- **Archivo**: `prisma/migrations/20260719_add_discount_percentage/migration.sql`
- Agregó columna `discount_percentage` (INT, default 0) a tabla `products`
- Creó índice para optimizar búsquedas

#### Schema Prisma
- **Archivo**: `prisma/schema.prisma`
- Agregó campo `discountPercentage` al modelo `Product`
- Campo opcional con default 0

### 2. Backend APIs

#### Admin - Actualizar Producto
- **Archivo**: `api/admin/products/[id].ts`
- Agregó soporte para recibir `discountPercentage` en requests PUT
- Valida y persiste el descuento en la BD

#### Public - Endpoints de Productos
- Los endpoints existentes ya retornan el campo automáticamente:
  - `api/public/products.ts` (lista de productos)
  - `api/public/products/[id].ts` (producto individual)

#### Public - Órdenes
- **Archivo**: `api/public/orders.ts`
- Ya captura correctamente `unitPrice` con descuento aplicado
- No requiere cambios (funciona con precios ya descontados)

### 3. Frontend - Tipos y Datos

#### Tipos TypeScript
- **Archivo**: `src/types/index.ts`
- Agregó field `discountPercentage?: number` a interface `Product`

#### Store de Productos
- **Archivo**: `src/stores/productStore.ts`
- Mapea `discountPercentage` en ambas funciones:
  - `loadProducts()` - Lista de productos
  - `loadProductById()` - Producto individual

### 4. Frontend - Carrito de Compras

#### Composable useCart
- **Archivo**: `src/composables/useCart.ts`
- Calcula automáticamente precio con descuento al agregar al carrito:
  ```typescript
  if (product.isOutlet && product.discountPercentage) {
    const descuento = (product.precio * product.discountPercentage) / 100
    precioFinal = product.precio - descuento
  }
  ```
- El `precioUnitario` en CartItem siempre tiene el precio final aplicado
- CartStore y CartSummary ya usan este valor correctamente

### 5. Frontend - Visualización de Productos

#### ProductCard (Catálogo)
- **Archivo**: `src/components/ProductCard.vue`
- Cambio visual importante:
  - Reemplazó badge "OUTLET" con "-%{porcentaje}"
  - Muestra precio original **tachado**
  - Muestra precio final en **rojo y negrita**
- Ejemplo: `$ 100.000` (tachado) → `$ 70.000` (rojo)

#### ProductView (Detalle)
- **Archivo**: `src/views/ProductView.vue`
- Similar a ProductCard:
  - Precio original tachado
  - Precio final en rojo con porcentaje
- Muestra descuento solo si `isOutlet && discountPercentage > 0`

### 6. Frontend - Panel Administrativo

#### AdminProductEdit (Editar Producto)
- **Archivo**: `src/views/admin/AdminProductEdit.vue`
- Campo de descuento solo visible si producto es "outlet"
- Muestra vista previa del precio final en tiempo real:
  ```
  Porcentaje de Descuento: [30]%
  Precio final: $ 70.000
  ```
- Incluye función `formatCurrency()` para el cálculo

#### AdminProducts (Lista de Productos)
- **Archivo**: `src/views/admin/AdminProducts.vue`
- Agregó columna "Descuento" en tabla
- Muestra descuento solo para productos outlet con descuento
- Badge rojo con "-30%" (por ejemplo)

### 7. Checkout y Órdenes

#### CheckoutView
- **Archivo**: `src/views/CheckoutView.vue`
- Ya usa `item.precioUnitario` en el resumen
- Los totales incluyen automáticamente los descuentos
- No requiere cambios (todo funciona automáticamente)

#### CartSummary y CartItem
- Ya calculan totales usando `precioUnitario`
- No requieren cambios

## Flujo Completo

### Para Administrador:
1. Edita producto
2. Marca como "Outlet"
3. Aparece campo "Porcentaje de Descuento"
4. Ingresa porcentaje (ej: 30)
5. Ve vista previa del precio final
6. Guarda cambios
7. Descuento se aplica en la BD

### Para Cliente:
1. Ve producto en catálogo
   - Badge muestra "-30%" (no "OUTLET")
   - Precio original tachado
   - Precio final en rojo
2. Abre detalle del producto
   - Ve mismo descuento
   - Agrega al carrito
3. Carrito calcula automáticamente precio con descuento
4. En checkout, ve totales correctos con descuento aplicado
5. Orden se genera con precio correcto

## Datos en Órdenes

Las órdenes capturan:
- `unitPrice`: Precio ya con descuento aplicado ($ 70.000)
- `subtotal`: Cantidad × unitPrice con descuento
- `total`: Suma de todos los subtotals

Esto es correcto porque el descuento se calcula en el carrito.

## Testing Sugerido

1. **Admin Panel:**
   - [ ] Editar producto, marcar como outlet
   - [ ] Campo descuento aparece/desaparece según outlet
   - [ ] Vista previa calcula correctamente
   - [ ] Guardar cambios

2. **Catálogo:**
   - [ ] Badge muestra porcentaje (no "OUTLET")
   - [ ] Precio original tachado
   - [ ] Precio final en rojo
   - [ ] No-outlet products no muestran cambios

3. **Detalle de Producto:**
   - [ ] Muestra descuento correctamente
   - [ ] Agrega al carrito con precio correcto

4. **Carrito:**
   - [ ] Suma totales con descuento aplicado
   - [ ] Resumen muestra precios correctos

5. **Checkout:**
   - [ ] Orden se crea con unitPrice correcto
   - [ ] Total de orden incluye descuento

6. **Admin Dashboard:**
   - [ ] Lista de productos muestra columna descuento
   - [ ] Muestra "-30%" solo para outlet con descuento

## Archivos Modificados

```
Base de Datos:
├── prisma/schema.prisma
├── prisma/migrations/20260719_add_discount_percentage/migration.sql

Backend:
├── api/admin/products/[id].ts

Frontend - Tipos:
├── src/types/index.ts

Frontend - Stores:
├── src/stores/productStore.ts

Frontend - Composables:
├── src/composables/useCart.ts

Frontend - Componentes:
├── src/components/ProductCard.vue
├── src/components/CartItem.vue
├── src/components/CartSummary.vue

Frontend - Vistas:
├── src/views/ProductView.vue
├── src/views/CheckoutView.vue
├── src/views/admin/AdminProductEdit.vue
├── src/views/admin/AdminProducts.vue
```

## Notas Técnicas

1. **Cálculo de Descuento**: Se realiza en el frontend cuando se agrega al carrito
2. **Persistencia**: El `discountPercentage` se guarda en la BD
3. **Órdenes**: Capturan `unitPrice` ya con descuento aplicado
4. **Visualización**: Badge dinámico reemplaza texto "OUTLET"
5. **UI**: Precio original tachado, precio final en rojo

## Próximas Mejoras Opcionales

- Aplicar descuentos a nivel de línea en órdenes (guardar precio original + descuento separado)
- Reportes de descuentos aplicados
- Descuentos por categoría
- Descuentos por rango de fechas
- Códigos promocionales
