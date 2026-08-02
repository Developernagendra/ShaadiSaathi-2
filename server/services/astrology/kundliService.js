const { AstrologyProvider } = require('./astrologyProvider');

class KundliService extends AstrologyProvider {
  /**
   * Calculates Kundli/Ashtakoota Milan between two individuals.
   * @param {Object} payload 
   * @returns {Promise<Object>} Normalized frontend-ready response
   */
  async calculateGunMilan(payload) {
    const { bride, groom } = payload;
    
    this.validatePersonData('Bride', bride);
    this.validatePersonData('Groom', groom);

    // This calls the provider. If API keys are missing, it throws immediately.
    // Assuming the provider expects a standard format for Ashtakoota calculation.
    const apiPayload = {
      p1: {
        dob: bride.dob,
        tob: bride.time,
        city: bride.city
      },
      p2: {
        dob: groom.dob,
        tob: groom.time,
        city: groom.city
      }
    };

    const rawResponse = await this.makeRequest('/match_ashtakoot', apiPayload);

    // Normalize the response to ShaadiSaathi's expected structure
    // If we reach here, we assume the API was called and returned valid data.
    return this.normalizeKundliResponse(bride, groom, rawResponse);
  }

  validatePersonData(label, personData) {
    if (!personData || !personData.dob || !personData.time || !personData.city) {
      const error = new Error(`Missing required birth details for ${label}. Date of birth, time of birth, and city are required.`);
      error.statusCode = 400; // Validation error
      throw error;
    }
  }

  normalizeKundliResponse(bride, groom, rawResponse) {
    // In a real implementation with a provider like VedicAstroAPI, 
    // `rawResponse` would contain the exact scores. 
    // Here we map those fields to the uniform ShaadiSaathi frontend contract.
    
    // Example defensive mapping:
    const breakdown = Object.entries(rawResponse.score || {}).map(([key, val]) => ({
      name: key, // e.g., 'Varna'
      description: val.description || '',
      score: val.obtained || 0,
      max: val.max || 0
    }));

    return {
      totalScore: rawResponse.totalScore || 0,
      maxScore: 36,
      percentage: rawResponse.percentage || 0,
      isGoodMatch: rawResponse.totalScore >= 18,
      compatibilityLevel: rawResponse.compatibilityLevel || 'Pending',
      brideDetails: {
        name: bride.name || 'Bride',
        nakshatraName: rawResponse.brideDetails?.nakshatraName || '',
        pada: rawResponse.brideDetails?.pada || '',
        rashiName: rawResponse.brideDetails?.rashiName || '',
        city: bride.city
      },
      groomDetails: {
        name: groom.name || 'Groom',
        nakshatraName: rawResponse.groomDetails?.nakshatraName || '',
        pada: rawResponse.groomDetails?.pada || '',
        rashiName: rawResponse.groomDetails?.rashiName || '',
        city: groom.city
      },
      breakdown,
      manglikAnalysis: rawResponse.manglikAnalysis || {},
      recommendations: rawResponse.recommendations || [],
      disclaimer: 'Calculated using real astrology provider APIs.'
    };
  }
}

module.exports = new KundliService();
