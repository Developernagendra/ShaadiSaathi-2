/**
 * Simplified Astronomical Calculations for Vedic Astrology (Kundli & Muhurat)
 * Based on Jean Meeus' Astronomical Algorithms and standard Vedic rules.
 */

// Math helpers
const PI = Math.PI;
const RAD = PI / 180.0;
const DEG = 180.0 / PI;

function normalizeAngle(degrees) {
  let a = degrees % 360;
  if (a < 0) a += 360;
  return a;
}

// Convert Gregorian Date to Julian Day (J2000 epoch is JD 2451545.0)
function getJulianDay(date) {
  let Y = date.getUTCFullYear();
  let M = date.getUTCMonth() + 1;
  const D = date.getUTCDate() + (date.getUTCHours() + date.getUTCMinutes() / 60.0 + date.getUTCSeconds() / 3600.0) / 24.0;

  if (M <= 2) {
    Y -= 1;
    M += 12;
  }
  
  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + D + B - 1524.5;
}

/**
 * Calculate Approximate Moon Longitude (Tropical)
 * Returns degrees [0, 360)
 */
function getMoonLongitude(jd) {
  const T = (jd - 2451545.0) / 36525.0; // Julian centuries since J2000
  
  // Mean longitude of the Moon
  let L_prime = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T;
  // Mean elongation of the Moon
  const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T;
  // Mean anomaly of the Sun
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T;
  // Mean anomaly of the Moon
  const M_prime = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T;
  // Argument of latitude
  const F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T;

  L_prime = normalizeAngle(L_prime);

  // Major perturbations in longitude
  let deltaL = 22640 * Math.sin(M_prime * RAD)
             - 4586 * Math.sin((M_prime - 2 * D) * RAD)
             + 2370 * Math.sin(2 * D * RAD)
             + 769 * Math.sin(2 * M_prime * RAD)
             - 668 * Math.sin(M * RAD)
             - 412 * Math.sin((2 * F) * RAD)
             - 212 * Math.sin((2 * M_prime - 2 * D) * RAD)
             - 206 * Math.sin((M_prime + M - 2 * D) * RAD)
             + 192 * Math.sin((M_prime + 2 * D) * RAD)
             - 165 * Math.sin((M_prime - M) * RAD)
             - 125 * Math.sin(D * RAD)
             - 110 * Math.sin((M_prime + M) * RAD)
             + 148 * Math.sin((M_prime - M - 2 * D) * RAD)
             - 55 * Math.sin((2 * F - 2 * D) * RAD);
             
  // Convert from millionths of a degree
  deltaL = deltaL / 1000000.0;
  
  return normalizeAngle(L_prime + deltaL);
}

/**
 * Calculate Approximate Sun Longitude (Tropical)
 * Returns degrees [0, 360)
 */
function getSunLongitude(jd) {
  const T = (jd - 2451545.0) / 36525.0;
  let L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  let M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  
  L0 = normalizeAngle(L0);
  M = normalizeAngle(M);
  
  // Sun's equation of center
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * RAD)
          + (0.019993 - 0.000101 * T) * Math.sin(2 * M * RAD)
          + 0.000289 * Math.sin(3 * M * RAD);
          
  const trueLong = normalizeAngle(L0 + C);
  return trueLong;
}

/**
 * Ayanamsa (Lahiri/Chitra Paksha) Calculation
 * To convert Tropical (Sayana) to Sidereal (Nirayana) for Vedic astrology
 */
function getAyanamsa(jd) {
  const T = (jd - 2451545.0) / 36525.0; // Century from J2000
  // True Ayanamsa approximation (Lahiri)
  // J2000 Ayanamsa = 23d 51' 11" ~ 23.853
  const ayanamsa = 23.853055 + (50.290966 / 3600.0) * (jd - 2451545.0) / 365.25;
  return ayanamsa;
}

/**
 * Get Vedic Lunar Details (Nakshatra, Pada, Rashi, Tithi)
 */
function getVedicDetails(date) {
  const jd = getJulianDay(date);
  const ayanamsa = getAyanamsa(jd);
  
  let sunLong = getSunLongitude(jd);
  let moonLong = getMoonLongitude(jd);
  
  // Convert to Sidereal
  sunLong = normalizeAngle(sunLong - ayanamsa);
  moonLong = normalizeAngle(moonLong - ayanamsa);
  
  // 1. Tithi (Lunar Day)
  let diff = normalizeAngle(moonLong - sunLong);
  const tithiIndex = Math.floor(diff / 12) + 1; // 1 to 30
  
  // 2. Nakshatra (Lunar Mansion)
  // 27 Nakshatras, each is 13 degrees 20 minutes = 13.3333... degrees
  const nakshatraIndex = Math.floor(moonLong / (360 / 27)); 
  const pada = Math.floor((moonLong % (360 / 27)) / (360 / 108)) + 1; // 1 to 4
  
  // 3. Rashi (Moon Sign)
  // 12 signs, each is 30 degrees
  const rashiIndex = Math.floor(moonLong / 30);
  
  const NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
  ];
  
  const RASHIS = [
    "Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)", "Karka (Cancer)",
    "Simha (Leo)", "Kanya (Virgo)", "Tula (Libra)", "Vrishchika (Scorpio)",
    "Dhanu (Sagittarius)", "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)"
  ];
  
  const TITHIS = [
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi",
    "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi",
    "Trayodashi", "Chaturdashi", "Purnima", "Pratipada", "Dwitiya", "Tritiya",
    "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami",
    "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"
  ];
  const paksha = tithiIndex <= 15 ? "Shukla" : "Krishna";

  return {
    moonLongitudeSidereal: moonLong,
    sunLongitudeSidereal: sunLong,
    tithiNumber: tithiIndex,
    tithiName: TITHIS[tithiIndex - 1] + " (" + paksha + " Paksha)",
    nakshatraNumber: nakshatraIndex + 1,
    nakshatraName: NAKSHATRAS[nakshatraIndex],
    pada: pada,
    rashiNumber: rashiIndex + 1,
    rashiName: RASHIS[rashiIndex]
  };
}

/**
 * Ashtakoota Guna Milan (36-point match)
 * Based on Nakshatra and Rashi of Bride and Groom
 * Returns detailed score break-down
 */
function calculateAshtakoota(brideDetails, groomDetails) {
  let score = 0;
  const breakdown = [];

  // Varna (1 point) - Based on Rashi
  // Brahman (4, 8, 12), Kshatriya (1, 5, 9), Vaishya (2, 6, 10), Shudra (3, 7, 11)
  const getVarna = (rashiNum) => [0, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4][rashiNum - 1]; 
  const bVarna = getVarna(brideDetails.rashiNumber);
  const gVarna = getVarna(groomDetails.rashiNumber);
  const varnaScore = (gVarna <= bVarna) ? 1 : 0; // Groom's varna should be <= Bride's varna spiritually
  score += varnaScore;
  breakdown.push({ name: 'Varna', description: 'Work/Spiritual Compatibility', score: varnaScore, max: 1 });

  // Vashya (2 points) - Based on Rashi
  // Simplified logic for Demo: Just assign 2 if same or compatible group
  const vashyaScore = (brideDetails.rashiNumber === groomDetails.rashiNumber) ? 2 : 1; 
  score += vashyaScore;
  breakdown.push({ name: 'Vashya', description: 'Dominance/Attraction', score: vashyaScore, max: 2 });

  // Tara (3 points) - Based on Nakshatra distance
  let dist = (brideDetails.nakshatraNumber - groomDetails.nakshatraNumber);
  if (dist < 0) dist += 27;
  const taraVal = (dist % 9) + 1;
  const taraScore = (taraVal % 2 === 0) ? 3 : (taraVal === 1 ? 1.5 : 1); 
  score += taraScore;
  breakdown.push({ name: 'Tara', description: 'Destiny/Health Compatibility', score: taraScore, max: 3 });

  // Yoni (4 points) - Physical compatibility
  const yoniScore = (Math.abs(brideDetails.nakshatraNumber - groomDetails.nakshatraNumber) % 5 === 0) ? 4 : 2;
  score += yoniScore;
  breakdown.push({ name: 'Yoni', description: 'Physical/Intimate Compatibility', score: yoniScore, max: 4 });

  // Graha Maitri (5 points) - Planetary friendship based on Rashi Lord
  // Simplified for approximation
  const maitriScore = (brideDetails.rashiNumber % 2 === groomDetails.rashiNumber % 2) ? 5 : 3;
  score += maitriScore;
  breakdown.push({ name: 'Graha Maitri', description: 'Mental/Intellectual Friendship', score: maitriScore, max: 5 });

  // Gana (6 points) - Temperament (Deva, Manushya, Rakshasa)
  const getGana = (nakNum) => [1,2,3,2,1,2,1,1,3,3,2,2,1,3,1,2,1,3,3,2,2,1,3,3,2,2,1][nakNum - 1];
  const bGana = getGana(brideDetails.nakshatraNumber);
  const gGana = getGana(groomDetails.nakshatraNumber);
  let ganaScore = 0;
  if (bGana === gGana) ganaScore = 6;
  else if ((bGana === 1 && gGana === 2) || (bGana === 2 && gGana === 1)) ganaScore = 5;
  else if (bGana === 3 || gGana === 3) ganaScore = 1; // Rakshasa match with others is low
  else ganaScore = 3;
  score += ganaScore;
  breakdown.push({ name: 'Gana', description: 'Temperament/Nature', score: ganaScore, max: 6 });

  // Bhakoot (7 points) - Rashi distance
  let rashiDist = brideDetails.rashiNumber - groomDetails.rashiNumber;
  if (rashiDist < 0) rashiDist += 12;
  const bhakootScore = [7, 7, 7, 7, 7, 7, 0, 7, 0, 0, 7, 7][rashiDist];
  score += bhakootScore;
  breakdown.push({ name: 'Bhakoot', description: 'Family/Life Growth', score: bhakootScore, max: 7 });

  // Nadi (8 points) - Genetic/Health
  const getNadi = (nakNum) => [1,2,3,3,2,1,1,2,3,3,2,1,1,2,3,3,2,1,1,2,3,3,2,1,1,2,3][nakNum - 1];
  const bNadi = getNadi(brideDetails.nakshatraNumber);
  const gNadi = getNadi(groomDetails.nakshatraNumber);
  const nadiScore = (bNadi === gNadi) ? 0 : 8; // Same Nadi is dosha
  score += nadiScore;
  breakdown.push({ name: 'Nadi', description: 'Health/Genetic Compatibility', score: nadiScore, max: 8 });

  return {
    totalScore: score,
    maxScore: 36,
    percentage: Math.round((score / 36) * 100),
    breakdown,
    brideDetails,
    groomDetails,
    isGoodMatch: score >= 18
  };
}

/**
 * Generate generic auspicious dates (Muhurat) for a given month and year
 * Real Panchang requires extensive Sunrise/Sunset calculation, so we 
 * calculate actual Tithi and Nakshatra for each day at Noon to find good days.
 */
function findMuhurats(year, month, city) {
  const dates = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    // Check at 12:00 UTC (Approx 17:30 IST)
    const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    const details = getVedicDetails(date);
    
    // Simple filter: Avoid Amavasya (30) and Rikta Tithis (4, 9, 14, 19, 24, 29)
    const riktaTithis = [4, 9, 14, 19, 24, 29];
    if (details.tithiNumber === 30 || riktaTithis.includes(details.tithiNumber)) {
      continue;
    }
    
    // Avoid certain Nakshatras generally considered inauspicious for marriage
    // e.g., Bharani (2), Krittika (3), Ashlesha (9), Magha (10), Jyeshtha (18), Mula (19)
    const badNakshatras = [2, 3, 9, 10, 18, 19];
    if (badNakshatras.includes(details.nakshatraNumber)) {
      continue;
    }

    dates.push({
      date: date.toISOString(),
      displayDate: date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      tithi: details.tithiName,
      nakshatra: details.nakshatraName,
      // Approximate Sunrise/Sunset for demonstration
      sunrise: "06:15 AM",
      sunset: "05:45 PM",
      muhuratTime: "07:30 PM to 11:45 PM",
      score: "High"
    });
    
    // Only return top 5-7 dates to keep it concise
    if (dates.length >= 7) break;
  }
  
  return dates;
}

module.exports = {
  getVedicDetails,
  calculateAshtakoota,
  findMuhurats
};
