const OpenAI = require('openai');
const Vendor = require('../models/Vendor');
const Package = require('../models/Package');
const mongoose = require('mongoose');

// Lazy-load ChatbotInteraction to avoid circular dep issues at startup
const getChatModel = () => {
  try {
    return require('../models/ChatbotInteraction');
  } catch {
    return null;
  }
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── OpenAI Function Calling Tool Definitions ────────────────────────
const tools = [
  {
    type: 'function',
    function: {
      name: 'search_vendors',
      description:
        'Search for wedding vendors (photographers, venues, caterers, makeup artists, DJs, Baraat Cabs, etc.) from the live database. Call this whenever the user asks for any vendor or Baraat cab recommendation.',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description:
              "Vendor category e.g. 'Photography', 'Venue', 'Makeup Artist', 'Baraat Cabs', 'Catering', 'DJ', 'Decoration'",
          },
          city: {
            type: 'string',
            description: 'City or location for the wedding',
          },
          maxBudget: {
            type: 'number',
            description: "Maximum budget in INR the user is willing to spend",
          },
        },
        required: ['category'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_packages',
      description:
        'Search for full wedding packages from the database. Call this when user asks for complete wedding packages, all-inclusive deals, or wedding planners.',
      parameters: {
        type: 'object',
        properties: {
          maxBudget: {
            type: 'number',
            description: 'Maximum total budget for the wedding package in INR',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'estimate_budget',
      description:
        "Calculate a wedding budget breakdown when user shares their total budget. Use this whenever the user mentions a total budget figure and wants to plan or estimate costs.",
      parameters: {
        type: 'object',
        properties: {
          totalBudget: {
            type: 'number',
            description:
              'Total wedding budget in INR (e.g. 500000 for 5 lakh)',
          },
          city: {
            type: 'string',
            description: 'City where the wedding will take place',
          },
        },
        required: ['totalBudget'],
      },
    },
  },
];

const SYSTEM_PROMPT = `You are the ShaadiSaathi AI Wedding Assistant — a premium, intelligent, and warm wedding concierge for the ShaadiSaathi platform.

Your role:
- Help users plan their dream wedding
- Find the best vendors (photographers, venues, caterers, makeup artists, DJs, decorators)
- Recommend Baraat cabs (Scorpio, Innova, Audi, Luxury Bus, etc.)
- Estimate and plan wedding budgets
- Suggest complete wedding packages

IMPORTANT RULES:
1. Always be warm, enthusiastic, and professional. Use occasional emojis for friendliness.
2. If a user asks for ANY vendor or service, ALWAYS call the 'search_vendors' tool — never make up vendors.
3. If user mentions Baraat, cabs, cars (Scorpio, Innova, Fortuner, Audi etc.), call 'search_vendors' with category "Baraat Cabs".
4. If user shares a total wedding budget, call 'estimate_budget' to provide a breakdown.
5. If user asks for wedding packages, call 'search_packages'.
6. Keep your text responses SHORT and elegant. The UI renders rich cards for vendor/package data — just introduce the results briefly.
7. If no results are found, suggest the user broaden their search or contact ShaadiSaathi support.`;

// ─── Execute a Tool Call ─────────────────────────────────────────────
const executeToolCall = async (name, args) => {
  if (name === 'search_vendors') {
    const query = { status: 'approved' };
    if (args.category) {
      const isCab =
        args.category.toLowerCase().includes('cab') ||
        args.category.toLowerCase().includes('baraat') ||
        args.category.toLowerCase().includes('car');
      query.category = isCab
        ? { $regex: 'Baraat Cabs', $options: 'i' }
        : { $regex: args.category.trim(), $options: 'i' };
    }
    if (args.city) query.city = { $regex: args.city.trim(), $options: 'i' };
    if (args.maxBudget) query.price = { $lte: Number(args.maxBudget) };

    const vendors = await Vendor.find(query)
      .select('businessName category city price rating coverImage _id isVerified')
      .limit(5)
      .lean();

    return { type: 'vendors', data: vendors };
  }

  if (name === 'search_packages') {
    const query = {};
    if (args.maxBudget) query.finalPrice = { $lte: Number(args.maxBudget) };

    const packages = await Package.find(query)
      .select('name finalPrice shortDescription _id isPopular coverImage')
      .limit(4)
      .lean();

    return { type: 'packages', data: packages };
  }

  if (name === 'estimate_budget') {
    const total = Number(args.totalBudget);
    const data = {
      venueAndCatering: Math.round(total * 0.45),
      jewelryAndAttire: Math.round(total * 0.20),
      photography: Math.round(total * 0.10),
      decoration: Math.round(total * 0.10),
      baraatCabs: Math.round(total * 0.05),
      miscellaneous: Math.round(total * 0.10),
    };
    return { type: 'budget', data, total };
  }

  return null;
};

// ─── POST /api/chatbot/message ───────────────────────────────────────
exports.sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message || !sessionId) {
      return res.status(400).json({ success: false, message: 'message and sessionId are required' });
    }

    // Check OpenAI key
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        success: true,
        data: {
          role: 'assistant',
          content:
            "I'm sorry, the AI assistant is not configured yet. Please contact the ShaadiSaathi support team for help planning your wedding! 💍",
          uiPayload: null,
        },
      });
    }

    // Load chat history from DB (last 6 messages to save tokens)
    const ChatbotInteraction = getChatModel();
    let chatSession = null;
    let recentMessages = [];

    if (ChatbotInteraction) {
      chatSession = await ChatbotInteraction.findOne({ sessionId });
      if (!chatSession) {
        chatSession = new ChatbotInteraction({ sessionId, messages: [] });
      }
      recentMessages = chatSession.messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...recentMessages,
      { role: 'user', content: message },
    ];

    // Save user message
    if (chatSession) {
      chatSession.messages.push({ role: 'user', content: message });
    }

    // First OpenAI call — may return a tool_call
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      tools,
      tool_choice: 'auto',
    });

    const responseMessage = response.choices[0].message;
    let finalContent = responseMessage.content || '';
    let uiPayload = null;

    // Handle tool call
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      const toolCall = responseMessage.tool_calls[0];
      const toolName = toolCall.function.name;
      const toolArgs = JSON.parse(toolCall.function.arguments || '{}');

      uiPayload = await executeToolCall(toolName, toolArgs);

      // Feed result back to OpenAI for a natural language response
      messages.push(responseMessage);
      messages.push({
        tool_call_id: toolCall.id,
        role: 'tool',
        name: toolName,
        content: JSON.stringify(uiPayload || {}),
      });

      const secondResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
      });

      finalContent = secondResponse.choices[0].message.content || '';
    }

    // Save AI response to DB
    if (chatSession) {
      chatSession.messages.push({ role: 'assistant', content: finalContent, uiPayload });
      await chatSession.save().catch((e) =>
        console.error('[CHATBOT] Failed to save session:', e.message)
      );
    }

    return res.status(200).json({
      success: true,
      data: { role: 'assistant', content: finalContent, uiPayload },
    });
  } catch (error) {
    console.error('[CHATBOT] Error:', error.message);

    // Graceful fallback so the UI never shows a raw error
    return res.status(200).json({
      success: true,
      data: {
        role: 'assistant',
        content:
          "I'm having a little trouble right now. Please try again in a moment, or browse our vendors directly on the platform! 💍",
        uiPayload: null,
      },
    });
  }
};

// ─── GET /api/chatbot/history/:sessionId ────────────────────────────
exports.getHistory = async (req, res) => {
  try {
    const ChatbotInteraction = getChatModel();
    if (!ChatbotInteraction) {
      return res.status(200).json({ success: true, data: [] });
    }

    const session = await ChatbotInteraction.findOne({
      sessionId: req.params.sessionId,
    });

    return res.status(200).json({
      success: true,
      data: session ? session.messages : [],
    });
  } catch (error) {
    console.error('[CHATBOT] getHistory error:', error.message);
    return res.status(200).json({ success: true, data: [] });
  }
};
