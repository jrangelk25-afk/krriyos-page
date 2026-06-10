import { gsap } from 'gsap'

const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const getDuration = (duration: number): number => {
  return prefersReducedMotion() ? 0.01 : duration
}

export const useGSAP = () => {
  const animateIn = (
    selector: string,
    options?: { delay?: number; duration?: number; stagger?: number }
  ) => {
    const elements = document.querySelectorAll(selector)
    if (!elements.length) return

    const duration = getDuration(options?.duration ?? 0.6)
    const delay = options?.delay ?? 0

    gsap.fromTo(
      elements,
      {
        opacity: 0,
        y: 30,
      },
      {
        opacity: 1,
        y: 0,
        duration,
        stagger: options?.stagger ?? 0,
        ease: 'power2.out',
        delay,
      }
    )
  }

  const staggerElements = (
    selector: string,
    options?: { duration?: number; stagger?: number; delay?: number }
  ) => {
    const elements = document.querySelectorAll(selector)
    if (!elements.length) return

    const duration = getDuration(options?.duration ?? 0.6)
    const stagger = options?.stagger ?? 0.1

    gsap.fromTo(
      elements,
      {
        opacity: 0,
        y: 30,
      },
      {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        ease: 'power2.out',
        delay: options?.delay ?? 0,
      }
    )
  }

  const scaleHover = (selector: string, scale: number = 1.05) => {
    const elements = document.querySelectorAll(selector)
    elements.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        gsap.to(el, {
          scale,
          duration: getDuration(0.3),
          ease: 'power2.out',
        })
      })

      el.addEventListener('mouseleave', () => {
        gsap.to(el, {
          scale: 1,
          duration: getDuration(0.3),
          ease: 'power2.out',
        })
      })
    })
  }

  const slideDrawer = (
    element: HTMLElement | null,
    isOpen: boolean,
    direction: 'left' | 'right' = 'right'
  ) => {
    if (!element) return

    const xDirection = direction === 'right' ? 100 : -100
    const duration = getDuration(isOpen ? 0.4 : 0.3)
    const ease = isOpen ? 'power2.out' : 'power2.in'

    gsap.to(element, {
      x: isOpen ? 0 : xDirection,
      opacity: isOpen ? 1 : 0,
      duration,
      ease,
      pointerEvents: isOpen ? 'auto' : 'none',
    })
  }

  const heroTimeline = (containerSelector: string) => {
    const container = document.querySelector(containerSelector)
    if (!container) return

    const tl = gsap.timeline()

    const duration = getDuration(0.7)

    // Efecto de zoom ken en la imagen de fondo
    tl.fromTo(
      `${containerSelector} img`,
      { scale: 1.1, opacity: 0 },
      { scale: 1, opacity: 1, duration: duration * 1.5, ease: 'power2.out' },
      0
    )

    tl.fromTo(
      `${containerSelector} .hero-headline`,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration, ease: 'power2.out' },
      0
    )

    tl.fromTo(
      `${containerSelector} .hero-description`,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration, ease: 'power2.out' },
      duration * 0.3
    )

    tl.fromTo(
      `${containerSelector} .hero-button`,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration, ease: 'power2.out' },
      duration * 0.6
    )

    return tl
  }

  const parallaxEffect = (selector: string, speed: number = 0.5) => {
    const element = document.querySelector(selector) as HTMLElement
    if (!element) return

    window.addEventListener('scroll', () => {
      if (prefersReducedMotion()) return
      const scrollY = window.scrollY
      gsap.to(element, {
        y: scrollY * speed,
        duration: 0,
        overwrite: 'auto',
      })
    })
  }

  return {
    animateIn,
    staggerElements,
    scaleHover,
    slideDrawer,
    heroTimeline,
    parallaxEffect,
    prefersReducedMotion,
  }
}
