const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const OpenAI = require('openai');
const { Category, Vendor } = require('../models');

// Initialize OpenAI SDK
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Global Circuit Breaker State
const providerHealth = {
  provider: 'openai',
  status: 'up', // 'up' or 'down'
  reason: null,
  retryAfter: null // Timestamp when we can try again
};

exports.generateWeddingPlan = catchAsync(async (req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) console.time("AI_REQUEST_TOTAL");
  const { 
    brideName, groomName, weddingDate, city, budget, guestCount, weddingType, 
    servicesRequired, indoorOutdoor, luxuryLevel, theme, foodPreference, 
    vehicleRequirement, photographyStyle, resetCircuit, language 
  } = req.body;

  // Manual reset of the circuit breaker from the frontend
  if (resetCircuit) {
    providerHealth.status = 'up';
    providerHealth.reason = null;
    providerHealth.retryAfter = null;
  }

  if (!city || !budget || !guestCount) {
    return next(new AppError('Please provide city, budget and guest count', 400));
  }

  // --- DYNAMIC DATA GENERATION ---
  const b = Number(budget) || 500000;
  
  // 1. Dynamic Budget Breakdown
  const budgetBreakdown = [
    { category: "Venue & Catering", amount: Math.floor(b * 0.45), percentage: 45, notes: "Major portion of budget for guest comfort and meal arrangements." },
    { category: "Photography", amount: Math.floor(b * 0.15), percentage: 15, notes: "Capturing cinematic and candid memories." },
    { category: "Decoration", amount: Math.floor(b * 0.15), percentage: 15, notes: "Theme decoration, floral mandap, and stage lighting." },
    { category: "Attire & Makeup", amount: Math.floor(b * 0.15), percentage: 15, notes: "Bridal makeup and groom attire." },
    { category: "Miscellaneous", amount: Math.floor(b * 0.10), percentage: 10, notes: "Contingency fund and transport services." }
  ];

  // 2. Dynamic Timeline Calculation
  const generateDynamicTimeline = (weddingDateStr) => {
    if (!weddingDateStr) {
      return [
        { timeframe: "6-12 Months Before", tasks: ["Set date and budget", "Book primary venue", "Hire wedding planner"] },
        { timeframe: "3-6 Months Before", tasks: ["Book photographer & decorator", "Finalize wedding guest list"] },
        { timeframe: "1-3 Months Before", tasks: ["Send invitations", "Book makeup artist & pandit"] },
        { timeframe: "1 Week Before", tasks: ["Finalize catering headcount", "Reconfirm all booked vendors"] }
      ];
    }
    const wDate = new Date(weddingDateStr);
    const formatDate = (date) => date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    const minusMonths = (d, m) => new Date(new Date(d).setMonth(d.getMonth() - m));
    const minusDays = (d, days) => new Date(new Date(d).setDate(d.getDate() - days));

    return [
      { timeframe: `By ${formatDate(minusMonths(wDate, 6))}`, tasks: ["Set wedding date and finalize budget", "Shortlist and book primary wedding venue", "Hire photographer and planner"] },
      { timeframe: `By ${formatDate(minusMonths(wDate, 3))}`, tasks: ["Book makeup artist and wedding decorator", "Finalize catering menu and food selection", "Begin outfit trials"] },
      { timeframe: `By ${formatDate(minusMonths(wDate, 1))}`, tasks: ["Dispatch digital invitations and wedding website", "Confirm guest RSVP list", "Book baraat cabs / guest transport"] },
      { timeframe: `By ${formatDate(minusDays(wDate, 7))}`, tasks: ["Finalize catering headcount", "Run through coordinate schedules with DJ, Pandit, and Decorator", "Reconfirm all bookings"] }
    ];
  };
  const dynamicTimeline = generateDynamicTimeline(weddingDate);

  // Map language code to full language name
  const langName = language === 'hi' ? 'Hindi' : language === 'bho' ? 'Bhojpuri' : language === 'mai' ? 'Maithili' : 'English';

  // --- AI GENERATION ---
  const prompt = `
    You are an expert Indian wedding planner named "ShaadiSaathi AI".
    Create a highly detailed, personalized wedding master plan for a couple with these details:
    - Bride: ${brideName || 'Bride'}
    - Groom: ${groomName || 'Groom'}
    - Wedding Date: ${weddingDate || 'Not decided'}
    - City: ${city}
    - Total Budget: ₹${budget}
    - Guest Count: ${guestCount}
    - Wedding Type/Vibe: ${weddingType || 'Traditional'}
    - Indoor / Outdoor preference: ${indoorOutdoor || 'Any'}
    - Luxury Level: ${luxuryLevel || 'Standard'}
    - Preferred Theme: ${theme || 'Traditional Mandap'}
    - Food Preference: ${foodPreference || 'Veg & Non-Veg'}
    - Vehicle Requirement: ${vehicleRequirement || 'None'}
    - Photography Style: ${photographyStyle || 'Cinematic & Traditional'}
    - Key Services Required: ${servicesRequired ? servicesRequired.join(', ') : 'All standard services'}
    - Preferred Output Language: ${langName}

    You MUST output valid, structured JSON exactly matching the following schema.
    Ensure ALL text values (summaries, items, ideas, tips) are beautifully written in ${langName}.
    Do NOT include Markdown formatting like \`\`\`json. Return raw JSON only.

    {
      "summary": "Short inspiring summary of the wedding plan in ${langName}",
      "checklist": [
        { "phase": "Pre-Wedding", "items": ["Finalize Guest List"] }
      ],
      "recommendations": [
        { "service": "Photography", "ideas": ["Candid styles", "Drone shoot"] }
      ],
      "tips": ["Book vendors early"],
      "priorityList": ["Book venue first", "Secure photographer"],
      "recommendedPackage": "Royal Grand Elite Package",
      "estimatedExpenses": ${b}
    }
  `;

  let aiPlan = null;
  let isFallback = false;

  // Check Circuit Breaker
  if (providerHealth.status === 'down') {
    if (Date.now() < providerHealth.retryAfter) {
      console.warn(`⚡ Circuit Breaker OPEN: Skipping OpenAI request. Reason: ${providerHealth.reason}`);
    } else {
      console.log("⚡ Circuit Breaker HALF-OPEN: Attempting OpenAI connection again.");
      providerHealth.status = 'up'; // Reset and try again
    }
  }

  // OpenAI Integration
  if (openai && providerHealth.status === 'up') {
    let retries = 2;
    let delay = 1000;

    if (isDev) console.time("OPENAI_EXECUTION");
    while (retries > 0 && !aiPlan) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000); // Strict timeout

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a specialized JSON-output AI. You only return valid, strictly typed JSON objects. You NEVER output markdown formatting."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          response_format: { type: "json_object" }
        }, { signal: controller.signal });

        clearTimeout(timeoutId);

        const aiResponseRaw = completion.choices[0].message.content;
        aiPlan = JSON.parse(aiResponseRaw);
      } catch (error) {
        const status = error.status;
        const errType = error.error?.type || error.type;
        
        if (status === 429 || status === 401 || errType === 'insufficient_quota' || errType === 'invalid_api_key') {
          console.error(`❌ OpenAI Critical Error (${status} - ${errType}): Disabling provider for 30 minutes.`);
          providerHealth.status = 'down';
          providerHealth.reason = errType || 'quota_or_auth_error';
          providerHealth.retryAfter = Date.now() + (5 * 60 * 1000);
          aiPlan = null;
          break;
        }

        console.warn(`⚠️ OpenAI attempt failed. Retries left: ${retries - 1}. Error:`, error.message);
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 1.5;
        } else {
          console.error("❌ OpenAI completely failed after retries. Falling back to local templates.");
        }
      }
    }
    if (isDev) console.timeEnd("OPENAI_EXECUTION");
  }

  // Dynamic DB-driven fallback if OpenAI fails
  if (!aiPlan) {
    if (isDev) console.time("FALLBACK_GENERATION");
    
    // Tailor mock recommended package and tips depending on luxuryLevel and budget
    let fallbackPackage = "Essential Elegance Package";
    let fallbackTips = [
      "Book your venue at least 6 months in advance.",
      "Keep a 15% buffer in your budget for unexpected costs.",
      "Delegate wedding day coordination tasks to reliable family members."
    ];

    if (luxuryLevel === 'Elite' || luxuryLevel === 'Luxury' || b > 1000000) {
      fallbackPackage = "Heritage Palace Elite Package";
      fallbackTips.push("Consider hiring a dedicated hospitality team for destination coordination.");
    } else {
      fallbackTips.push("Consolidate decorations to single statements rather than multi-stage floral setups.");
    }

    aiPlan = {
      summary: `A beautiful ${weddingType || 'Traditional'} ${indoorOutdoor || 'Indoor'} wedding in ${city} for ${brideName || 'the bride'} and ${groomName || 'the groom'} hosting ${guestCount} guests, crafted dynamically by ShaadiSaathi AI. Theme matches ${theme || 'Mandap Elegance'}.`,
      checklist: [
        { phase: "Pre-Wedding", items: ["Finalize wedding guest list", "Book matching caterers", "Select photography packages"] },
        { phase: "Wedding Day", items: ["Rings ready", "Vendor payments verified", "Coordination with Pandit/DJ"] }
      ],
      recommendations: [
        { service: "Venue", ideas: ["Pastel floral themes", "Mandap setups"] },
        { service: "Photography", ideas: ["Candid photography", "Drone coverage", "Pre-wedding shoot"] },
        { service: "Catering", ideas: ["Traditional buffet", "Live counters", "Signature mocktails"] }
      ],
      tips: fallbackTips,
      priorityList: ["Book primary Venue first", "Secure your preferred Photographer", "Finalize DJ & Pandit timings"],
      recommendedPackage: fallbackPackage,
      estimatedExpenses: b
    };
    isFallback = true;
    if (isDev) console.timeEnd("FALLBACK_GENERATION");
  }

  // Merge budget and timeline data
  aiPlan.budgetBreakdown = budgetBreakdown;
  aiPlan.timeline = dynamicTimeline;

  // --- DYNAMIC DATABASE VENDORS & CABS FETCHING ---
  if (isDev) console.time("DATABASE_VENDORS_FETCH");
  let localVendors = [];
  try {
    const Category = require('../models/index').Category;
    const Vendor = require('../models/Vendor');
    const Booking = require('../models/index').Booking;

    const categories = await Category.find({ isActive: true });
    
    // Parse Date for unavailability check
    const dateObj = new Date(weddingDate);
    const startOfDay = new Date(dateObj.setHours(0,0,0,0));
    const endOfDay = new Date(dateObj.setHours(23,59,59,999));

    // Resolve which categories are requested
    const targetCategories = servicesRequired && servicesRequired.length > 0
      ? categories.filter(c => servicesRequired.includes(c.name))
      : categories.filter(c => c.name !== 'Cab Service'); // Default to all except Cabs

    const vendorPromises = targetCategories.map(async (cat) => {
      // Find budget slice
      let allocatedBudget = 0;
      const budgetItem = budgetBreakdown.find(item => cat.name.includes(item.category.split(' ')[0]));
      if (budgetItem) {
        allocatedBudget = budgetItem.amount;
      } else {
        allocatedBudget = Math.floor(b * 0.10); // 10% default
      }

      // Base query criteria with availability validation
      const baseCriteria = {
        category: cat._id,
        approvalStatus: 'approved',
        isActive: true,
        $or: [
          { 'location.city': { $regex: new RegExp(city, 'i') } },
          { serviceAreas: { $regex: new RegExp(city, 'i') } }
        ],
        unavailableDates: {
          $not: {
            $elemMatch: {
              $gte: startOfDay,
              $lte: endOfDay
            }
          }
        }
      };

      // Helper query function with fallback to nearby cities if no exact match
      const fetchGroup = async (queryFilter, sortCriteria) => {
        let results = await Vendor.find(queryFilter)
          .sort(sortCriteria)
          .limit(3)
          .populate('category', 'name icon slug')
          .lean();

        // Self-Healing Fallback: If no matches in selected city, pull matching vendors globally/nearby
        if (results.length === 0) {
          const fallbackCriteria = { ...queryFilter };
          delete fallbackCriteria.$or;
          delete fallbackCriteria['location.city'];
          results = await Vendor.find(fallbackCriteria)
            .sort(sortCriteria)
            .limit(3)
            .populate('category', 'name icon slug')
            .lean();
        }
        return results;
      };

      // 1. Budget Options: sorted by price ascending
      const budgetCriteria = { ...baseCriteria, basePrice: { $lte: allocatedBudget } };
      const budgetVendors = await fetchGroup(budgetCriteria, { basePrice: 1 });

      // 2. Premium Options: elite/premium subscription, sorted by rating
      const premiumCriteria = { ...baseCriteria };
      const premiumVendors = await fetchGroup(premiumCriteria, { 'rating.average': -1, basePrice: -1 });

      // 3. Fast Response Options: sorted by response speed / ratings
      const responseVendors = await fetchGroup(baseCriteria, { responseTime: 1, 'rating.average': -1 });

      // Format function
      const formatGroup = (rawVendors) => {
        return rawVendors.map(v => {
          let score = 80;
          if (v.basePrice <= allocatedBudget) score += 10;
          if (v.badges && v.badges.includes('verified')) score += 5;
          if (v.subscription && ['premium', 'elite', 'silver', 'gold', 'platinum'].includes(v.subscription.plan)) score += 5;
          if (v.rating && v.rating.average >= 4.5) score += 5;
          score = Math.min(99, score);

          const availabilityText = (v.rating && v.rating.count > 10) ? 'Limited Slots' : 'Available';

          const dynamicBadges = [];
          if (score >= 95) dynamicBadges.push('Best Match');
          if (v.basePrice <= allocatedBudget) dynamicBadges.push('Within Budget');
          if (v.rating && v.rating.count > 12) dynamicBadges.push('Most Popular');
          if (v.responseTime && ['Within 1 hour', 'Within 2 hours', 'Within 15 mins'].includes(v.responseTime)) dynamicBadges.push('Fast Response');
          if (v.badges && v.badges.includes('verified')) dynamicBadges.push('Verified');
          if (v.subscription && ['premium', 'elite', 'silver', 'gold', 'platinum'].includes(v.subscription.plan)) dynamicBadges.push('Premium');
          if (v.isTrending) dynamicBadges.push('Trending');
          if (score >= 90) dynamicBadges.push('AI Recommended');
          if (v.basePrice <= allocatedBudget * 0.7 && v.rating?.average >= 4.0) dynamicBadges.push('Best Value');

          let recommendedPackage = null;
          if (v.packages && v.packages.length > 0) {
            const valid = v.packages.filter(p => p.price <= allocatedBudget).sort((a,b) => b.price - a.price);
            recommendedPackage = valid.length > 0 ? valid[0] : [...v.packages].sort((a,b) => a.price - b.price)[0];
          }

          return {
            _id: v._id,
            businessName: v.businessName,
            coverImage: v.coverImage?.url || (v.images && v.images[0]?.url) || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
            rating: v.rating || { average: 0, count: 0 },
            basePrice: v.basePrice || 0,
            responseTime: v.responseTime || 'Within 2 hours',
            badges: dynamicBadges,
            matchScore: score,
            availability: availabilityText,
            recommendedPackage,
            phone: v.phone || v.whatsappNumber || '0000000000',
            city: v.location?.city || city,
            categoryName: cat.name
          };
        });
      };

      return {
        categoryName: cat.name,
        allocatedBudget,
        budget: formatGroup(budgetVendors),
        premium: formatGroup(premiumVendors),
        fastResponse: formatGroup(responseVendors)
      };
    });

    const resolvedVendors = await Promise.all(vendorPromises);
    localVendors = resolvedVendors.filter(v => v !== null);

    // --- BARAAT CABS SPECIFIC MATCHING ---
    const needCabs = servicesRequired && (servicesRequired.includes('Cab Service') || servicesRequired.includes('Baraat Cab')) || (vehicleRequirement && vehicleRequirement !== 'None');
    if (needCabs) {
      const Cab = require('../models/index').Cab;

      // Active Bookings to filter availability
      const activeBookings = await Booking.find({
        bookingType: { $in: ['cab', 'baraat-cab'] },
        eventDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['pending', 'confirmed', 'in_progress'] }
      }).select('cab fleetSelection').lean();

      const bookedCounts = {};
      activeBookings.forEach(bo => {
        if (bo.cab) bookedCounts[bo.cab.toString()] = (bookedCounts[bo.cab.toString()] || 0) + 1;
        if (bo.fleetSelection && bo.fleetSelection.length > 0) {
          bo.fleetSelection.forEach(fs => {
            if (fs.cabId) bookedCounts[fs.cabId.toString()] = (bookedCounts[fs.cabId.toString()] || 0) + (fs.count || 1);
          });
        }
      });

      const cabBaseCriteria = {
        status: 'approved',
        isActive: true,
        isAvailable: true,
        'location.city': { $regex: new RegExp(city, 'i') }
      };

      let allCabs = await Cab.find(cabBaseCriteria).populate('vendor').lean();
      
      // Fallback
      if (allCabs.length === 0) {
        allCabs = await Cab.find({ status: 'approved', isActive: true, isAvailable: true }).populate('vendor').lean();
      }

      // Filter out fully booked ones
      const availableCabs = allCabs.filter(c => {
        const total = c.totalFleet || c.quantityAvailable || 1;
        const booked = bookedCounts[c._id.toString()] || 0;
        return booked < total;
      });

      const cabBudgetAllocated = Math.floor(b * 0.08); // 8% allocation for cabs

      const formatCabGroup = (rawCabs) => {
        return rawCabs.map(c => {
          const fare = c.price || c.pricing?.baseFare || 0;
          const booked = bookedCounts[c._id.toString()] || 0;
          const total = c.totalFleet || c.quantityAvailable || 1;
          const isLimited = (total - booked) <= 1;

          let score = 80;
          if (fare <= cabBudgetAllocated) score += 10;
          if (c.rating?.average >= 4.5) score += 10;
          score = Math.min(99, score);

          const dynamicBadges = [];
          if (score >= 95) dynamicBadges.push('Best Match');
          if (fare <= cabBudgetAllocated) dynamicBadges.push('Within Budget');
          if (c.rating?.count > 10) dynamicBadges.push('Most Popular');
          if (c.isApproved) dynamicBadges.push('Verified');
          if (['suv', 'luxury_car', 'vintage_car'].includes(c.type)) dynamicBadges.push('Premium');
          if (score >= 90) dynamicBadges.push('AI Recommended');

          let recommendedPackage = null;
          if (c.packages && c.packages.length > 0) {
            const valid = c.packages.filter(p => p.price <= cabBudgetAllocated).sort((a,b) => b.price - a.price);
            recommendedPackage = valid.length > 0 ? valid[0] : [...c.packages].sort((a,b) => a.price - b.price)[0];
          }

          return {
            _id: c._id,
            businessName: c.name || `${c.brand} ${c.model}`,
            coverImage: (c.images && c.images[0]?.url) || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
            rating: c.rating || { average: 0, count: 0 },
            basePrice: fare,
            responseTime: c.vendor?.responseTime || 'Within 2 hours',
            badges: dynamicBadges,
            matchScore: score,
            availability: isLimited ? 'Limited Slots' : 'Available',
            recommendedPackage,
            phone: c.vendor?.phone || '0000000000',
            city: c.location?.city || city,
            isCab: true,
            categoryName: 'Baraat Cab'
          };
        });
      };

      const budgetCabs = [...availableCabs].sort((a,b) => (a.price || 0) - (b.price || 0));
      const premiumCabs = [...availableCabs].filter(c => ['suv', 'luxury_car', 'vintage_car'].includes(c.type)).sort((a,b) => (b.rating?.average || 0) - (a.rating?.average || 0));
      const responseCabs = [...availableCabs].sort((a,b) => (a.rating?.average || 0) - (b.rating?.average || 0));

      localVendors.push({
        categoryName: 'Baraat Cab',
        allocatedBudget: cabBudgetAllocated,
        budget: formatCabGroup(budgetCabs.slice(0, 3)),
        premium: formatCabGroup(premiumCabs.slice(0, 3).concat(budgetCabs.filter(x => !premiumCabs.includes(x))).slice(0, 3)),
        fastResponse: formatCabGroup(responseCabs.slice(0, 3))
      });
    }

  } catch (dbError) {
    console.error("❌ Database Error while fetching local vendors:", dbError);
  }
  if (isDev) console.timeEnd("DATABASE_VENDORS_FETCH");

  if (isDev) console.time("RESPONSE_SERIALIZATION");
  const responseData = {
    success: true,
    message: isFallback ? 'AI Plan generated using fallback engine.' : 'AI Plan generated successfully.',
    data: {
      aiPlan,
      localVendors,
      meta: { brideName, groomName, weddingDate, city, budget, guestCount },
      fallback: isFallback
    },
    errors: null
  };
  
  res.status(200).json(responseData);
  if (isDev) console.timeEnd("RESPONSE_SERIALIZATION");
  if (isDev) console.timeEnd("AI_REQUEST_TOTAL");
});

exports.getHealth = catchAsync(async (req, res, next) => {
  let status = 'healthy';
  
  if (!openai || providerHealth.status === 'down') {
    status = 'degraded';
  }

  res.status(200).json({
    status: status,
    provider: providerHealth.provider,
    providerStatus: providerHealth.status,
    reason: providerHealth.reason,
    cooldownRemainingMs: providerHealth.retryAfter ? Math.max(0, providerHealth.retryAfter - Date.now()) : 0,
    message: status === 'healthy' ? 'AI Provider is active' : 'AI Provider is unavailable. Using Local Templates.'
  });
});
