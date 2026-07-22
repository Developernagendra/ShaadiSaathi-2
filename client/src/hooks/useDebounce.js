import { useState, useEffect } from 'react'

/**
 * useDebounce — delays updating a value until after the specified delay.
 * Use for search inputs to avoid firing API calls on every keystroke.
 *
 * @param {*} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 400ms)
 * @returns {*} debouncedValue
 *
 * @example
 * const debouncedSearch = useDebounce(searchQuery, 400)
 * useEffect(() => { fetchResults(debouncedSearch) }, [debouncedSearch])
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
