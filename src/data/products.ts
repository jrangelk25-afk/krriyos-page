import type { Product } from '../types'

// Importar imágenes de productos
import zapato1Front from '/FOTOS/zapato-1/front.webp?url'
import zapato1Det1 from '/FOTOS/zapato-1/detalle-1.webp?url'
import zapato1Det2 from '/FOTOS/zapato-1/detalle-2.webp?url'
import zapato2Front from '/FOTOS/zapato-2/front.webp?url'
import zapato2Det1 from '/FOTOS/zapato-2/detalle-1.webp?url'
import zapato2Det2 from '/FOTOS/zapato-2/detalle-2.webp?url'
import zapato3Front from '/FOTOS/zapato-3/front.webp?url'
import zapato3Det1 from '/FOTOS/zapato-3/detalle-1.webp?url'
import zapato3Det2 from '/FOTOS/zapato-3/detalle-2.webp?url'
import zapato4Front from '/FOTOS/zapato-4/front.webp?url'
import zapato4Det1 from '/FOTOS/zapato-4/detalle-1.webp?url'
import zapato4Det2 from '/FOTOS/zapato-4/detalle-2.webp?url'
import zapato5Front from '/FOTOS/zapato-5/front.webp?url'
import zapato5Det1 from '/FOTOS/zapato-5/detalle-1.webp?url'
import zapato5Det2 from '/FOTOS/zapato-5/detalle-2.webp?url'
import zapato6Front from '/FOTOS/zapato-6/front.webp?url'
import zapato6Det1 from '/FOTOS/zapato-6/detalle-1.webp?url'
import zapato6Det2 from '/FOTOS/zapato-6/detalle-2.webp?url'

export const PRODUCTS: Product[] = [
  {
    id: 'krr-01',
    sku: 'KRR-01',
    nombre: 'CLASSIC RUNNER',
    descripcion: 'Sneaker de alto rendimiento con tecnología de amortiguación premium. Diseño minimalista con detalles arquitectónicos.',
    precio: 129.99,
    imagenes: [zapato1Front, zapato1Det1, zapato1Det2],
    categoria: 'Sneakers',
    tallas: ['36', '37', '38', '39', '40', '41', '42', '43'],
    stock: 15,
    isNewArrival: true,
  },
  {
    id: 'krr-02',
    sku: 'KRR-02',
    nombre: 'URBAN PULSE',
    descripcion: 'Sneaker versatil con suela de alta tracción. Perfecto para uso diario con estilo premium.',
    precio: 139.99,
    imagenes: [zapato2Front, zapato2Det1, zapato2Det2],
    categoria: 'Sneakers',
    tallas: ['36', '37', '38', '39', '40', '41', '42', '43'],
    stock: 12,
    isNewArrival: true,
  },
  {
    id: 'krr-03',
    sku: 'KRR-03',
    nombre: 'VERTEX PRO',
    descripcion: 'Zapatilla de rendimiento extremo con refuerzos laterales. Diseño futurista y agresivo.',
    precio: 149.99,
    imagenes: [zapato3Front, zapato3Det1, zapato3Det2],
    categoria: 'Sneakers',
    tallas: ['36', '37', '38', '39', '40', '41', '42', '43'],
    stock: 18,
    isNewArrival: false,
  },
  {
    id: 'krr-04',
    sku: 'KRR-04',
    nombre: 'NOIR EDITION',
    descripcion: 'Edición limitada en negro puro con detalles plateados. Elegancia urban extrema.',
    precio: 159.99,
    imagenes: [zapato4Front, zapato4Det1, zapato4Det2],
    categoria: 'Urban',
    tallas: ['36', '37', '38', '39', '40', '41', '42', '43'],
    stock: 8,
    isNewArrival: true,
  },
  {
    id: 'krr-05',
    sku: 'KRR-05',
    nombre: 'STREET FLEX',
    descripcion: 'Zapatilla urbana con capacidad de respuesta premium. Ideal para movilidad en la ciudad.',
    precio: 119.99,
    imagenes: [zapato5Front, zapato5Det1, zapato5Det2],
    categoria: 'Urban',
    tallas: ['36', '37', '38', '39', '40', '41', '42', '43'],
    stock: 20,
    isNewArrival: false,
  },
  {
    id: 'krr-06',
    sku: 'KRR-06',
    nombre: 'ALPINE TREK',
    descripcion: 'Bota de aventura con resistencia extrema. Diseñada para terrenos hostiles.',
    precio: 199.99,
    imagenes: [zapato6Front, zapato6Det1, zapato6Det2],
    categoria: 'Botas',
    tallas: ['36', '37', '38', '39', '40', '41', '42', '43'],
    stock: 9,
    isNewArrival: false,
  },
]

export const CATEGORIES = [
  {
    id: 'sneakers',
    nombre: 'SNEAKERS',
    descripcion: 'La ingeniería del movimiento',
  },
  {
    id: 'urban',
    nombre: 'URBAN',
    descripcion: 'Versatilidad sin compromiso',
  },
  {
    id: 'botas',
    nombre: 'BOTAS',
    descripcion: 'Aventura extrema',
  },
]
