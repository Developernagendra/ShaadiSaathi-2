const axios = require('axios');

class AstrologyProviderError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'AstrologyProviderError';
    this.code = code;
  }
}

/**
 * Base provider class for interacting with external Astrology APIs.
 */
class AstrologyProvider {
  constructor() {
    this.apiUrl = process.env.ASTROLOGY_API_URL;
    this.apiKey = process.env.ASTROLOGY_API_KEY;
    this.isConfigured = !!(this.apiUrl && this.apiKey);
  }

  /**
   * Validates if the provider is properly configured before making a request.
   */
  checkConfiguration() {
    if (!this.isConfigured) {
      throw new AstrologyProviderError(
        'Kundli/Muhurat calculation service is currently unavailable.',
        'ASTROLOGY_PROVIDER_NOT_CONFIGURED'
      );
    }
  }

  /**
   * Generic request handler for API calls.
   * @param {string} endpoint - API endpoint (e.g., '/match_ashtakoot')
   * @param {Object} payload - Data payload for the provider
   * @returns {Promise<Object>} API response data
   */
  async makeRequest(endpoint, payload) {
    this.checkConfiguration();

    try {
      const response = await axios.post(`${this.apiUrl}${endpoint}`, payload, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 seconds timeout
      });

      return response.data;
    } catch (error) {
      console.error('[AstrologyProvider API Error]:', error.response?.data || error.message);
      throw new AstrologyProviderError(
        'Unable to calculate astrology data at this time. Please try again.',
        'ASTROLOGY_PROVIDER_ERROR'
      );
    }
  }
}

module.exports = {
  AstrologyProvider,
  AstrologyProviderError
};
