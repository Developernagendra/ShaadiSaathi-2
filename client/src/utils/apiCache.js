/**
 * A lightweight in-memory cache for API responses to improve perceived load times.
 * Useful for hover-preloading and instant navigation without external libraries like React Query.
 */
class ApiCache {
  constructor() {
    this.cache = new Map()
    // Default TTL: 5 minutes
    this.DEFAULT_TTL = 5 * 60 * 1000
  }

  /**
   * Set data in cache
   * @param {string} key - Cache key (usually the API endpoint or query string)
   * @param {any} data - Data to store
   * @param {number} [ttl] - Time to live in milliseconds
   */
  set(key, data, ttl = this.DEFAULT_TTL) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
    })
  }

  /**
   * Get data from cache
   * @param {string} key - Cache key
   * @returns {any|null} Returns the cached data if valid, else null
   */
  get(key) {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  /**
   * Check if a valid key exists
   * @param {string} key 
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null
  }

  /**
   * Clear specific key or entire cache
   * @param {string} [key] - If omitted, clears entire cache
   */
  clear(key) {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }
}

// Export as a singleton
export const apiCache = new ApiCache()
export default apiCache
