const { AstrologyProvider } = require('./astrologyProvider');

class MuhuratService extends AstrologyProvider {
  /**
   * Calculates Shubh Muhurats (auspicious dates) for a specific city/month/year.
   * @param {Object} payload 
   * @returns {Promise<Object>} Normalized frontend-ready response
   */
  async calculateMuhurat(payload) {
    const { city, state, year, month } = payload;
    
    this.validateMuhuratData(payload);

    // This calls the provider. If API keys are missing, it throws immediately.
    // Provider expects a specific format to query the Panchang for a location & month.
    const apiPayload = {
      location: { city, state },
      period: { year, month }
    };

    const rawResponse = await this.makeRequest('/find_muhurat', apiPayload);

    // Normalize the response to ShaadiSaathi's expected structure
    return this.normalizeMuhuratResponse(payload, rawResponse);
  }

  validateMuhuratData(payload) {
    if (!payload.city) {
      const error = new Error('City is required to calculate Muhurat accurately based on local sunrise/sunset.');
      error.statusCode = 400;
      throw error;
    }
    if (!payload.year || !payload.month) {
      const error = new Error('Year and month are required to find Muhurats.');
      error.statusCode = 400;
      throw error;
    }
  }

  normalizeMuhuratResponse(payload, rawResponse) {
    const { city, state, year, month } = payload;
    
    // In a real provider, rawResponse would contain the array of auspicious dates
    // For our frontend, we need an array of `muhurats`
    const rawMuhurats = Array.isArray(rawResponse.dates) ? rawResponse.dates : [];
    
    const muhurats = rawMuhurats.map((m) => ({
      date: m.date || '',
      displayDate: m.displayDate || m.date,
      nakshatra: m.nakshatra || '',
      tithi: m.tithi || '',
      muhuratTime: m.bestTime || '',
      rahuKaal: m.rahuKaal || '',
      score: m.strength || 0,
      reason: m.reason || '',
      city: city,
      state: state || ''
    }));

    return {
      city,
      state: state || '',
      year: parseInt(year, 10),
      month: parseInt(month, 10),
      muhurats,
      disclaimer: 'Muhurat calculations are based on local mathematical ephemeris.'
    };
  }
}

module.exports = new MuhuratService();
