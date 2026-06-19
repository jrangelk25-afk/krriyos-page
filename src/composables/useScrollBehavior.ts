import { nextTick, ref } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

export interface ScrollConfig {
  behavior?: 'smooth' | 'auto'
  delay?: number
  offset?: number
  restoreHistory?: boolean
}

interface ScrollPosition {
  top: number
  left: number
}

/**
 * Sistema robusto de manejo de scroll para navegación
 * Características:
 * - Control granular por ruta
 * - Restauración de posición en historial
 * - Soporte para animaciones y delays
 * - Manejo elegante de casos especiales
 */
export const useScrollBehavior = () => {
  // Estado global del scroll
  const scrollHistory = new Map<string, ScrollPosition>()
  const isScrolling = ref(false)
  const scrollConfig = ref<ScrollConfig>({
    behavior: 'smooth',
    delay: 0,
    offset: 0,
    restoreHistory: true,
  })

  /**
   * Guarda la posición actual del scroll
   */
  const saveScrollPosition = (routePath: string) => {
    // Usar la misma lógica que getCurrentScroll en main.ts
    const currentScroll = Math.max(
      window.scrollY,
      document.documentElement.scrollTop,
      document.body.scrollTop
    )
    const pos = {
      top: currentScroll,
      left: window.scrollX,
    }
    scrollHistory.set(routePath, pos)
  }

  /**
   * Obtiene la posición guardada del scroll
   */
  const getScrollPosition = (routePath: string): ScrollPosition | undefined => {
    return scrollHistory.get(routePath)
  }

  /**
   * Limpia el historial de scroll para una ruta específica
   */
  const clearScrollPosition = (routePath?: string) => {
    if (routePath) {
      scrollHistory.delete(routePath)
    } else {
      scrollHistory.clear()
    }
  }

  /**
   * Ejecuta el scroll con control de estado
   */
  const executeScroll = async (
    target: number | string | HTMLElement,
    options: ScrollConfig = {}
  ) => {
    if (isScrolling.value) return

    isScrolling.value = true
    const config = { ...scrollConfig.value, ...options }

    try {
      // Esperar a que Vue termine de renderizar
      await nextTick()

      // Aplicar delay si se especifica
      if (config.delay && config.delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, config.delay))
      }

      // Determinar la posición de scroll
      let scrollTop = 0

      if (typeof target === 'number') {
        scrollTop = target
      } else if (typeof target === 'string') {
        // Si es un selector (ej: '#section-id')
        const element = document.querySelector(target)
        if (element) {
          scrollTop = element.getBoundingClientRect().top + window.scrollY
        }
      } else if (target instanceof HTMLElement) {
        scrollTop = target.getBoundingClientRect().top + window.scrollY
      }

      // Aplicar offset
      scrollTop = Math.max(0, scrollTop - (config.offset || 0))

      // Ejecutar el scroll
      window.scrollTo({
        top: scrollTop,
        left: 0,
        behavior: config.behavior || 'auto',
      })
    } finally {
      isScrolling.value = false
    }
  }

  /**
   * Reset de scroll al top (para navegación)
   */
  const scrollToTop = (options: ScrollConfig = {}) => {
    return executeScroll(0, { behavior: 'auto', ...options })
  }

  /**
   * Scroll suave a un elemento específico
   */
  const scrollToElement = (
    selector: string,
    options: ScrollConfig = {}
  ) => {
    return executeScroll(selector, { behavior: 'smooth', ...options })
  }

  /**
   * Restaura la posición anterior (para botón atrás)
   */
  const restoreScrollPosition = async (
    routePath: string,
    options: ScrollConfig = {}
  ) => {
    const savedPosition = getScrollPosition(routePath)
    if (savedPosition && options.restoreHistory !== false) {
      await executeScroll(savedPosition.top, { behavior: 'auto', ...options })
    } else {
      await scrollToTop(options)
    }
  }

  /**
   * Configuración global del scroll
   */
  const setScrollConfig = (config: Partial<ScrollConfig>) => {
    scrollConfig.value = { ...scrollConfig.value, ...config }
  }

  /**
   * Router scroll behavior (para usar en router.beforeEach)
   */
  const getRouteScrollBehavior = (
    to: RouteLocationNormalizedLoaded,
    _from: RouteLocationNormalizedLoaded,
    savedPosition?: ScrollPosition
  ): ScrollConfig & { target?: number | string } => {
    // 1. Si hay posición guardada (botón atrás), restaurarla
    if (savedPosition) {
      return {
        target: savedPosition.top,
        behavior: 'auto',
      }
    }

    // 2. Si hay hash/anchor, scroll al elemento
    if (to.hash) {
      return {
        target: to.hash,
        behavior: 'smooth',
        delay: 100, // pequeño delay para que el elemento esté renderizado
      }
    }

    // 3. Rutas especiales pueden tener comportamiento custom
    const customBehaviors: Record<string, ScrollConfig> = {
      '/catalogo': { behavior: 'auto', offset: 80 }, // Offset para header sticky
      '/producto/:id': { behavior: 'auto' },
      '/checkout': { behavior: 'auto' },
    }

    const routeBehavior = customBehaviors[to.path]
    if (routeBehavior) {
      return { target: 0, ...routeBehavior }
    }

    // 4. Por defecto: scroll al top con animación suave
    return {
      target: 0,
      behavior: 'smooth',
    }
  }

  return {
    // State
    isScrolling,
    scrollHistory,

    // Methods
    saveScrollPosition,
    getScrollPosition,
    clearScrollPosition,
    executeScroll,
    scrollToTop,
    scrollToElement,
    restoreScrollPosition,
    setScrollConfig,
    getRouteScrollBehavior,
  }
}
