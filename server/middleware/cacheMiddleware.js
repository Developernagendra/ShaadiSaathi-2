// Simple in-memory cache using a native Map
const cache = new Map();

/**
 * Express middleware to cache API responses
 * @param {number} duration - TTL in seconds for this specific route
 */
const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Construct a unique cache key based on URL and query params
    const key = `__express__${req.originalUrl || req.url}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse && Date.now() < cachedResponse.expiry) {
      console.log(`[CACHE HIT] Returning cached response for ${key}`);
      return res.status(200).json(cachedResponse.data);
    }

    // Clean up expired entry if it exists
    if (cachedResponse && Date.now() >= cachedResponse.expiry) {
        cache.delete(key);
    }

    console.log(`[CACHE MISS] Fetching fresh data for ${key}`);

    // Store the original res.json function
    const originalJson = res.json;

    // Override res.json to intercept the response and cache it
    res.json = function (body) {
      // Restore original res.json to avoid infinite loops
      res.json = originalJson;

      // Only cache successful responses (HTTP 2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const ttl = duration ? duration * 1000 : 300 * 1000;
        cache.set(key, {
            data: body,
            expiry: Date.now() + ttl
        });
      }

      return res.json(body);
    };

    next();
  };
};

// Helper function to manually clear cache if needed (e.g. after data updates)
const clearCache = (keyPattern) => {
  if (!keyPattern) {
    cache.clear();
    console.log('[CACHE CLEARED] All cache cleared');
    return;
  }
  
  const keys = Array.from(cache.keys());
  const keysToDelete = keys.filter(k => k.includes(keyPattern));
  keysToDelete.forEach(k => cache.delete(k));
  console.log(`[CACHE CLEARED] Cleared cache for pattern: ${keyPattern}`);
};

module.exports = {
  cacheMiddleware,
  clearCache,
  cache // export instance for advanced usage if needed
};
