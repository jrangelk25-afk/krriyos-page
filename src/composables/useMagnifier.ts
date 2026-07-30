import { ref, computed, onMounted } from 'vue'

export const useMagnifier = (zoomLevel: number = 3) => {
  const magnifierPosition = ref({ x: 0, y: 0 })
  const showMagnifier = ref(false)
  const magnifierSize = 135
  const displaySize = ref({ width: 0, height: 0 })

  const handleMouseMove = (e: MouseEvent) => {
    const div = (e.currentTarget as HTMLElement)
    const rect = div.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Guardar el tamaño del display
    displaySize.value = {
      width: rect.width,
      height: rect.height
    }

    magnifierPosition.value = {
      x: Math.max(0, Math.min(x, rect.width)),
      y: Math.max(0, Math.min(y, rect.height))
    }
  }

  const handleMouseEnter = () => {
    showMagnifier.value = true
  }

  const handleMouseLeave = () => {
    showMagnifier.value = false
  }

  // Posición de la lupa circular
  const magnifierStyle = computed(() => {
    const { x, y } = magnifierPosition.value
    return {
      left: `${x - magnifierSize / 2}px`,
      top: `${y - magnifierSize / 2}px`,
      width: `${magnifierSize}px`,
      height: `${magnifierSize}px`
    }
  })

  // Background image style para mostrar el área ampliada
  const zoomedImageStyle = computed(() => {
    const { x, y } = magnifierPosition.value
    const { width: displayWidth, height: displayHeight } = displaySize.value
    
    // Calcular factor de escala entre display y imagen real (800x1000)
    const scaleX = 800 / (displayWidth || 1)
    const scaleY = 1000 / (displayHeight || 1)
    
    // Convertir coordenadas de display a coordenadas de imagen real
    const imageX = x * scaleX
    const imageY = y * scaleY
    
    // Calcular posición del background
    // Queremos que el área bajo el cursor quede en el centro de la lupa
    const bgPosX = -(imageX * zoomLevel - magnifierSize / 2)
    const bgPosY = -(imageY * zoomLevel - magnifierSize / 2)

    return {
      backgroundSize: `${800 * zoomLevel}px ${1000 * zoomLevel}px`,
      backgroundPosition: `${bgPosX}px ${bgPosY}px`,
      backgroundRepeat: 'no-repeat'
    }
  })

  return {
    magnifierPosition,
    showMagnifier,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
    magnifierStyle,
    zoomedImageStyle,
    magnifierSize
  }
}
