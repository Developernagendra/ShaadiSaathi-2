const NodeCache = require('node-cache');

// Create cache with stdTTL of 300 seconds (5 minutes) and checkperiod of 320 seconds
const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

/**
 * Express middleware to cache API responses
 * @param {number} duration - TTL in seconds for this specific route (overrides stdTTL)
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

    if (cachedResponse) {
      console.log(`[CACHE HIT] Returning cached response for ${key}`);
      return res.status(200).json(cachedResponse);
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
        if (duration) {
          cache.set(key, body, duration);
        } else {
          cache.set(key, body);
        }
      }

      return res.json(body);
    };

    next();
  };
};

// Helper function to manually clear cache if needed (e.g. after data updates)
const clearCache = (keyPattern) => {
  if (!keyPattern) {
    cache.flushAll();
    console.log('[CACHE CLEARED] All cache cleared');
    return;
  }
  
  const keys = cache.keys();
  const keysToDelete = keys.filter(k => k.includes(keyPattern));
  cache.del(keysToDelete);
  console.log(`[CACHE CLEARED] Cleared cache for pattern: ${keyPattern}`);
};

module.exports = {
  cacheMiddleware,
  clearCache,
  cache // export instance for advanced usage if needed
};
