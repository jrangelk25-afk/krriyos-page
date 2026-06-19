import { useScrollBehavior, type ScrollConfig } from './useScrollBehavior'

/**
 * Composable simplificado para usar en componentes
 * Proporciona métodos rápidos y comunes para control de scroll
 */
export const usePageScroll = () => {
  const scroll = useScrollBehavior()

  /**
   * Scroll suave a la parte superior de la página
   */
  const toTop = async () => {
    return scroll.scrollToTop({ behavior: 'smooth' })
  }

  /**
   * Scroll suave a un elemento por selector CSS
   * Ejemplo: toElement('#contact-section')
   */
  const toElement = async (selector: string, options?: ScrollConfig) => {
    return scroll.scrollToElement(selector, {
      ...options,
      behavior: 'smooth',
    })
  }

  /**
   * Scroll hacia un elemento con offset (útil con headers sticky)
   */
  const toElementWithOffset = async (
    selector: string,
    offsetPixels: number = 80,
    options?: ScrollConfig
  ) => {
    return scroll.scrollToElement(selector, {
      ...options,
      behavior: 'smooth',
      offset: offsetPixels,
    })
  }

  /**
   * Scroll instantáneo a una posición
   */
  const toPosition = async (topPixels: number) => {
    return scroll.executeScroll(topPixels, { behavior: 'auto' })
  }

  /**
   * Limpiar historial de scroll para la ruta actual
   */
  const clearHistory = () => {
    scroll.clearScrollPosition()
  }

  return {
    toTop,
    toElement,
    toElementWithOffset,
    toPosition,
    clearHistory,
    isScrolling: scroll.isScrolling,
  }
}
