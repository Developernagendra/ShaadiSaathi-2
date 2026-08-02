const OpenAI = require('openai');
const { WeddingPlan } = require('../models/ToolModels');
const dotenv = require('dotenv');

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate AI Wedding Plan
 */
exports.generatePlan = async (req, res) => {
  try {
    const { 
      budget, 
      guestCount, 
      location, 
      weddingStyle, 
      durationDays = 2,
      language = 'English',
      foodPreferences = 'Vegetarian',
      eventCount = 3,
      specialPreferences = ''
    } = req.body;

    if (!budget || !guestCount || !location || !weddingStyle) {
      return res.status(400).json({ status: 'fail', message: 'Missing required parameters' });
    }

    const prompt = `
      You are an expert Indian Wedding Planner for ShaadiSaathi.
      Please create a comprehensive wedding plan for the following details:
      - Budget: ${budget}
      - Guests: ${guestCount}
      - Location: ${location}
      - Style/Theme: ${weddingStyle}
      - Duration: ${durationDays} days
      - Events count: ${eventCount}
      - Food Preferences: ${foodPreferences}
      - Special Notes: ${specialPreferences}
      - Language: ${language}

      Respond strictly in JSON format matching this schema:
      {
        "budgetBreakdown": [
          { "category": "String (e.g. Venue, Catering)", "amount": "Number (approximate allocation)", "percentage": "Number" }
        ],
        "timeline": [
          { "day": "Number", "events": [{ "time": "String", "name": "String", "description": "String" }] }
        ],
        "vendorRecommendations": [
          { "type": "String", "priority": "High/Medium/Low", "notes": "String" }
        ]
      }
    `;

    // Only call OpenAI if an API key is available, else mock response for dev
    let aiResponse;
    if (process.env.OPENAI_API_KEY) {
      const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: "You are a helpful assistant designed to output JSON." }, { role: "user", content: prompt }],
        model: "gpt-3.5-turbo",
        response_format: { type: "json_object" },
      });
      aiResponse = JSON.parse(completion.choices[0].message.content);
    } else {
      // Mock Data for development if key is missing
      aiResponse = {
        budgetBreakdown: [
          { category: "Venue & Decoration", amount: budget * 0.35, percentage: 35 },
          { category: "Catering", amount: budget * 0.25, percentage: 25 },
          { category: "Photography", amount: budget * 0.15, percentage: 15 },
          { category: "Attire & Jewelry", amount: budget * 0.15, percentage: 15 },
          { category: "Miscellaneous", amount: budget * 0.10, percentage: 10 }
        ],
        timeline: [
          {
            day: 1,
            events: [
              { time: "10:00 AM", name: "Haldi & Mehndi", description: "Vibrant daytime ceremony" },
              { time: "07:00 PM", name: "Sangeet", description: "Evening of dance and music" }
            ]
          },
          {
            day: 2,
            events: [
              { time: "06:00 PM", name: "Baraat", description: "Groom's procession" },
              { time: "08:00 PM", name: "Phere", description: "Main wedding rituals" }
            ]
          }
        ],
        vendorRecommendations: [
          { type: "Premium Photographer", priority: "High", notes: "Book 6 months in advance" },
          { type: "Makeup Artist", priority: "High", notes: "Ensure trial before final booking" }
        ]
      };
    }

    const planData = {
      budgetDetails: {
        totalBudget: budget,
        guestCount: guestCount,
        breakdown: aiResponse.budgetBreakdown.map(b => ({
          category: b.category,
          estimatedCost: b.amount
        }))
      },
      timeline: aiResponse.timeline,
      vendorSuggestions: aiResponse.vendorRecommendations
    };

    // Save to DB if user is logged in
    let savedPlan = null;
    if (req.user) {
      savedPlan = await WeddingPlan.create({
        user: req.user._id,
        preferences: {
          budget,
          guestCount,
          location,
          weddingStyle,
          language,
          foodPreferences,
          eventCount,
          specialPreferences
        },
        generatedPlan: planData
      });
    }

    res.status(200).json({
      success: true,
      status: 'success',
      data: {
        planId: savedPlan ? savedPlan._id : null,
        plan: planData
      }
    });

  } catch (error) {
    console.error('AI Planner Error:', error);
    res.status(500).json({ success: false, status: 'error', message: 'Failed to generate AI plan' });
  }
};

/**
 * Get Saved Plans for a user
 */
exports.getSavedPlans = async (req, res) => {
  try {
    const plans = await WeddingPlan.find({ user: req.user._id }).sort('-createdAt');
    res.status(200).json({
      status: 'success',
      data: {
        plans
      }
    });
  } catch (error) {
    console.error('Get Plans Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch saved plans' });
  }
};
