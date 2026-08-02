const kundliService = require('./kundliService');
const muhuratService = require('./muhuratService');
const { AstrologyProviderError } = require('./astrologyProvider');

/**
 * Main Astrology Engine Facade.
 * Controllers should import and call this, not the individual services.
 */
class AstrologyEngine {
  /**
   * Calculate Gun Milan between a Bride and Groom
   * @param {Object} payload 
   * @returns {Promise<Object>} Normalized Report
   */
  async calculateGunMilan(payload) {
    return await kundliService.calculateGunMilan(payload);
  }

  /**
   * Find Shubh Muhurat for a specific city and month/year
   * @param {Object} payload 
   * @returns {Promise<Object>} List of Auspicious Dates
   */
  async calculateMuhurat(payload) {
    return await muhuratService.calculateMuhurat(payload);
  }
}

module.exports = {
  astrologyEngine: new AstrologyEngine(),
  AstrologyProviderError
};
