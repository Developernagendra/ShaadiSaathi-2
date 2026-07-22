import { useState, useEffect, useRef } from 'react'

/**
 * useIntersectionObserver — tracks whether an element is visible in the viewport.
 * Use as a lightweight alternative to Framer Motion's whileInView for simple
 * fade-in animations that don't need spring physics.
 *
 * @param {Object} options - IntersectionObserver options
 * @param {string} options.threshold - Visibility threshold (default: 0.1)
 * @param {string} options.rootMargin - Root margin (default: '0px')
 * @param {boolean} options.once - Only trigger once (default: true)
 * @returns {[React.RefObject, boolean]} [ref, isVisible]
 *
 * @example
 * const [ref, isVisible] = useIntersectionObserver()
 * return <div ref={ref} className={isVisible ? 'opacity-100' : 'opacity-0'} />
 */
export function useIntersectionObserver({
  threshold = 0.1,
  rootMargin = '0px',
  once = true,
} = {}) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)
  const observerRef = useRef(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Skip if IntersectionObserver not supported (SSR-safe)
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true)
      return
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once && observerRef.current) {
            observerRef.current.disconnect()
          }
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )

    observerRef.current.observe(element)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [threshold, rootMargin, once])

  return [ref, isVisible]
}
