/**
 * Composable para gestionar meta tags dinámicos
 * Permite actualizar Open Graph tags, Twitter cards y el título de la página
 * de forma dinámica según el contenido de cada vista
 */

export interface MetaData {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: string
  ogLocale?: string
}

/**
 * Actualiza los meta tags de la página
 * @param meta Objeto con los datos a actualizar
 */
export const useMetaTags = (meta: MetaData) => {
  const baseUrl = 'https://krriyos-page-production.up.railway.app'
  
  // Actualizar título de la página
  if (meta.title) {
    document.title = meta.title
    updateMetaTag('og:title', meta.title)
    updateMetaTag('twitter:title', meta.title)
  }

  // Actualizar descripción
  if (meta.description) {
    updateMetaTag('description', meta.description)
    updateMetaTag('og:description', meta.description)
    updateMetaTag('twitter:description', meta.description)
  }

  // Actualizar imagen
  if (meta.image) {
    const imageUrl = meta.image.startsWith('http') 
      ? meta.image 
      : `${baseUrl}${meta.image}`
    
    updateMetaTag('og:image', imageUrl)
    updateMetaTag('twitter:image', imageUrl)
  }

  // Actualizar URL
  if (meta.url) {
    const fullUrl = meta.url.startsWith('http') 
      ? meta.url 
      : `${baseUrl}${meta.url}`
    
    updateMetaTag('og:url', fullUrl)
  }

  // Actualizar tipo
  if (meta.type) {
    updateMetaTag('og:type', meta.type)
  }

  // Actualizar locale
  if (meta.ogLocale) {
    updateMetaTag('og:locale', meta.ogLocale)
  }
}

/**
 * Función auxiliar para actualizar o crear meta tags
 * @param name Nombre del atributo (property o name)
 * @param content Contenido del meta tag
 */
const updateMetaTag = (name: string, content: string) => {
  // Intentar encontrar meta tag existente
  let element = document.querySelector(`meta[property="${name}"]`) 
    || document.querySelector(`meta[name="${name}"]`)

  if (!element) {
    // Si no existe, crear uno nuevo
    element = document.createElement('meta')
    
    // Usar 'property' para og: y twitter: tags, 'name' para otros
    if (name.startsWith('og:') || name.startsWith('twitter:')) {
      element.setAttribute('property', name)
    } else {
      element.setAttribute('name', name)
    }
    
    document.head.appendChild(element)
  }

  // Actualizar contenido
  element.setAttribute('content', content)
}

/**
 * Restaura los meta tags a los valores por defecto
 */
export const resetMetaTags = () => {
  useMetaTags({
    title: 'krriyos - Orgullosos de Caminar Contigo',
    description: 'Descubre nuestra colección premium de calzado de alto rendimiento. Sneakers, Urban wear y botas diseñadas para el futuro.',
    image: '/logo.webp',
    url: '/',
    type: 'website',
    ogLocale: 'es_CO',
  })
}
