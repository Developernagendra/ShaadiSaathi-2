const fs = require('fs');
const enPath = './client/public/locales/en/translation.json';
const hiPath = './client/public/locales/hi/translation.json';

// Manually define the base JSON if parsing fails
const baseEn = {
  nav: {
    home: "Home", services: "Services", vendors: "Vendors", tools: "Tools",
    about: "About Us", contact: "Contact", blog: "Blog", userDashboard: "Dashboard",
    vendorDashboard: "Vendor Dashboard", booking: "Bookings"
  },
  auth: {
    login: "Login", register: "Register", logout: "Logout", forgot_password: "Forgot Password?",
    reset_password: "Reset Password", email: "Email Address", password: "Password", submit: "Submit"
  },
  common: {
    book_now: "Book Now", view_details: "View Details", dashboard: "Dashboard",
    profile: "Profile", settings: "Settings", language: "Language", save: "Save",
    cancel: "Cancel", edit: "Edit", delete: "Delete"
  },
  languages: {
    en: "English", hi: "हिन्दी (Hindi)", bho: "भोजपुरी (Bhojpuri)", mai: "मैथिली (Maithili)"
  },
  home: {
    title: "Find Trusted Wedding Services For Your Special Day", premium_marketplace: "Premium Wedding Marketplace",
    subtitle: "Simplify your wedding journey with trusted vendors, smart tools, and seamless booking.",
    explore: "Explore", wedding_services: "Wedding Services", featured: "Featured", vendors: "Vendors",
    luxury: "Luxury", baraat_cabs: "Baraat Cabs", why_choose: "Why Choose", ready_to_plan: "Ready To Plan Your",
    dream_wedding: "Dream Wedding?"
  },
  astrology: {
    "manglikNone": "No Manglik Dosha detected.",
    "manglikBothCancelled": "Both are Manglik. Dosha is cancelled. Excellent match.",
    "manglikBrideOnly": "Bride has Anshik (partial) Manglik Dosha. Puja recommended before marriage.",
    "manglikGroomOnly": "Groom has Anshik (partial) Manglik Dosha. Puja recommended before marriage.",
    "rashi": {
      "aries": "Mesha (Aries)",
      "taurus": "Vrishabha (Taurus)",
      "gemini": "Mithuna (Gemini)",
      "cancer": "Karka (Cancer)",
      "leo": "Simha (Leo)",
      "virgo": "Kanya (Virgo)",
      "libra": "Tula (Libra)",
      "scorpio": "Vrischika (Scorpio)",
      "sagittarius": "Dhanu (Sagittarius)",
      "capricorn": "Makara (Capricorn)",
      "aquarius": "Kumbha (Aquarius)",
      "pisces": "Meena (Pisces)"
    },
    "koota": {
      "varna": "Varna (Work)",
      "vashya": "Vashya (Dominance)",
      "tara": "Tara (Destiny)",
      "yoni": "Yoni (Mentality)",
      "grahaMaitri": "Graha Maitri (Compatibility)",
      "gana": "Gana (Temperament)",
      "bhakoot": "Bhakoot (Love)",
      "nadi": "Nadi (Health)"
    },
    "conclusionExcellent": "The match is highly recommended. You share good celestial compatibility.",
    "conclusionBelowAverage": "The match has below average compatibility. Astrological remedies are suggested.",
    "days": {
      "sunday": "Sunday",
      "monday": "Monday",
      "tuesday": "Tuesday",
      "wednesday": "Wednesday",
      "thursday": "Thursday",
      "friday": "Friday",
      "saturday": "Saturday"
    },
    "nakshatra": {
      "rohini": "Rohini",
      "mrigashira": "Mrigashira",
      "magha": "Magha",
      "uttara_phalguni": "Uttara Phalguni",
      "hasta": "Hasta",
      "swati": "Swati",
      "anuradha": "Anuradha",
      "moola": "Moola",
      "uttara_ashadha": "Uttara Ashadha",
      "uttara_bhadrapada": "Uttara Bhadrapada",
      "revati": "Revati"
    },
    "lagna": {
      "taurus": "Vrishabh Lagna",
      "gemini": "Mithun Lagna",
      "virgo": "Kanya Lagna",
      "libra": "Tula Lagna",
      "sagittarius": "Dhanu Lagna"
    },
    "tithi": {
      "shukla_panchami": "Shukla Paksha Panchami",
      "shukla_ekadashi": "Shukla Paksha Ekadashi",
      "krishna_ekadashi": "Krishna Paksha Ekadashi",
      "shukla_purnima": "Shukla Paksha Purnima",
      "shukla_navami": "Shukla Paksha Navami"
    },
    "significanceExcellent": "Excellent for Panigrahana and Saptapadi.",
    "labels": {
      "totalGun": "Total Gun Milan",
      "compatibility": "Match",
      "manglikAnalysis": "Manglik Analysis",
      "rashiDetails": "Rashi Details",
      "ashtaKoota": "Ashta Koota Breakdown",
      "downloadPdf": "Download PDF",
      "saveToProfile": "Save to Profile",
      "shareWhatsapp": "Share via WhatsApp",
      "print": "Print Report",
      "searchParams": "Search Parameters",
      "found": "Found",
      "auspiciousDates": "Auspicious Dates",
      "auspiciousTiming": "Auspicious Timing",
      "nakshatra": "Nakshatra",
      "lagna": "Lagna",
      "tithi": "Tithi",
      "rahuKaal": "Rahu Kaal",
      "abhijitMuhurat": "Abhijit Muhurat",
      "auspiciousRating": "Auspicious Rating"
    }
  }
};

const baseHi = JSON.parse(JSON.stringify(baseEn)); // Copy structure for HI

const footerEn = {
  "newsletter_title": "Subscribe to our Newsletter",
  "newsletter_desc": "Get the latest wedding trends, planning tips, and exclusive vendor offers delivered to your inbox.",
  "email_placeholder": "Your email address",
  "subscribing": "Subscribing…",
  "subscribe": "Subscribe",
  "company": "Company",
  "for_couples": "For Couples",
  "for_vendors": "For Vendors",
  "wedding_services": "Wedding Services",
  "popular_cities": "Popular Cities",
  "tagline": "बिहार की शादी, ShaadiSaathi के साथ",
  "brand_tagline_1": "शादी का सच्चा साथी",
  "brand_tagline_2": "बिहार की शादी, अब होगी आसान। Venue से लेकर Catering तक — आपकी शादी की पूरी तैयारी, एक ही जगह।"
};

const footerHi = {
  "newsletter_title": "हमारे Newsletter को Subscribe करें",
  "newsletter_desc": "नवीनतम वेडिंग ट्रेंड्स, प्लानिंग टिप्स और विशेष वेंडर ऑफर्स सीधे अपने इनबॉक्स में पाएं।",
  "email_placeholder": "आपका ईमेल पता",
  "subscribing": "Subscribe हो रहा है…",
  "subscribe": "Subscribe करें",
  "company": "कंपनी",
  "for_couples": "Couples के लिए",
  "for_vendors": "Vendors के लिए",
  "wedding_services": "वेडिंग Services",
  "popular_cities": "प्रमुख शहर",
  "tagline": "बिहार की शादी, ShaadiSaathi के साथ",
  "brand_tagline_1": "शादी का सच्चा साथी",
  "brand_tagline_2": "बिहार की शादी, अब होगी आसान। Venue से लेकर Catering तक — आपकी शादी की पूरी तैयारी, एक ही जगह।"
};

const toolsKeysEn = {
  title: 'Wedding Tools Hub 💍',
  subtitle: 'Plan Your Perfect Wedding — Smart, Simple & Stress-Free',
  hero_title: 'Wedding Tools Hub',
  hero_desc: 'Everything You Need to Plan Your Dream Wedding',
  hero_subdesc: 'Budget se lekar guest list, wedding checklist aur venue planning tak — sab kuch ek hi jagah.',
  hero_btn_explore: 'Explore Wedding Tools',
  hero_btn_start: 'Start Planning',
  search_placeholder: '🔍 Search wedding tools...',
  filter_all: 'All',
  filter_planning: 'Planning',
  filter_budget: 'Budget',
  filter_guests: 'Guests',
  filter_vendors: 'Vendors',
  filter_events: 'Events',
  filter_travel: 'Travel',
  filter_design: 'Design',
  
  tool_budget_title: 'Wedding Budget Planner',
  tool_budget_desc: 'Plan and manage your complete wedding budget.',
  tool_guest_title: 'Guest List Manager',
  tool_guest_desc: 'Manage guests, invitations and RSVP.',
  tool_checklist_title: 'Wedding Checklist',
  tool_checklist_desc: 'Never miss an important wedding task.',
  tool_timeline_title: 'Wedding Timeline',
  tool_timeline_desc: 'Plan every event and activity on time.',
  tool_vendor_title: 'Vendor Finder',
  tool_vendor_desc: 'Find trusted wedding vendors near you.',
  tool_venue_title: 'Venue Planner',
  tool_venue_desc: 'Discover and organize your wedding venue requirements.',
  tool_baraat_title: 'Baraat Planner',
  tool_baraat_desc: 'Plan your Baraat transportation and rides.',
  tool_invite_title: 'Wedding Invitation',
  tool_invite_desc: 'Create and manage your wedding invitations.',
  open_tool: 'Open Tool →',
  
  smart_tools_title: 'Smart Wedding Planning Tools 🧠',
  tool_ai_title: 'AI Wedding Planner',
  tool_ai_desc: 'Get personalized wedding planning suggestions.',
  tool_calc_budget_title: 'Budget Calculator',
  tool_calc_budget_desc: 'Calculate your estimated wedding expenses.',
  tool_calc_guest_title: 'Guest Budget Calculator',
  tool_calc_guest_desc: 'Estimate your catering and guest-related costs.',
  tool_tracker_title: 'Wedding Expense Tracker',
  tool_tracker_desc: 'Track your spending and stay within budget.',
  tool_countdown_title: 'Wedding Countdown',
  tool_countdown_desc: 'Count down to your big day.',
  
  bihar_tools_title: 'Plan Your Bihari Wedding ❤️',
  bihar_tools_subtitle: 'Traditional Bihar wedding planning, made simple.',
  bihar_mithila: 'Mithila Wedding Planner',
  bihar_baraat: 'Baraat Planner',
  bihar_dj: 'DJ & Band Planner',
  bihar_catering: 'Bihari Catering Planner',
  bihar_vivah: 'Vivah Bhawan Finder',
  bihar_purohit: 'Purohit / Pandit Finder',
  bihar_madhubani: 'Madhubani Wedding Inspiration',
  bihar_decoration: 'Traditional Decoration Ideas',
  
  journey_title: 'Wedding Planning Journey',
  journey_1: 'Plan',
  journey_2: 'Budget',
  journey_3: 'Find Vendors',
  journey_4: 'Book Services',
  journey_5: 'Manage Guests',
  journey_6: 'Celebrate 🎉',
  
  popular_title: 'Most Popular Wedding Tools 🔥',
  popular_usage: 'Highly Used',
  
  plan_title_auth: 'Your Wedding Plan ❤️',
  plan_progress: 'Wedding Planning Progress',
  plan_tasks_rem: 'Tasks Remaining',
  plan_days_left: 'Days Left',
  plan_cta_continue: 'Continue Planning →',
  
  plan_title_guest: 'Create Your Wedding Plan',
  plan_desc_guest: 'Login karke apni complete wedding planning ek jagah manage karein.',
  plan_cta_start: 'Start Planning →',
  
  cta_title: 'Your Dream Wedding Starts Here ❤️',
  cta_subtitle: 'Plan. Book. Celebrate.',
  cta_btn_start: 'Start Planning',
  cta_btn_explore: 'Explore Vendors',
  
  coming_soon: 'Coming Soon',
  explore: 'Explore'
};

const toolsKeysHi = {
  title: 'Wedding Tools Hub 💍',
  subtitle: 'Shaadi ki planning ab hogi aur bhi आसान ❤️',
  hero_title: 'Wedding Tools Hub',
  hero_desc: 'Everything You Need to Plan Your Dream Wedding',
  hero_subdesc: 'Budget se lekar guest list, wedding checklist aur venue planning tak — sab kuch ek hi jagah.',
  hero_btn_explore: 'Wedding Tools देखें',
  hero_btn_start: 'Planning शुरू करें',
  search_placeholder: '🔍 Search wedding tools...',
  filter_all: 'All',
  filter_planning: 'Planning',
  filter_budget: 'Budget',
  filter_guests: 'Guests',
  filter_vendors: 'Vendors',
  filter_events: 'Events',
  filter_travel: 'Travel',
  filter_design: 'Design',
  
  tool_budget_title: 'Wedding Budget Planner',
  tool_budget_desc: 'Plan and manage your complete wedding budget.',
  tool_guest_title: 'Guest List Manager',
  tool_guest_desc: 'Manage guests, invitations and RSVP.',
  tool_checklist_title: 'Wedding Checklist',
  tool_checklist_desc: 'Never miss an important wedding task.',
  tool_timeline_title: 'Wedding Timeline',
  tool_timeline_desc: 'Plan every event and activity on time.',
  tool_vendor_title: 'Vendor Finder',
  tool_vendor_desc: 'Find trusted wedding vendors near you.',
  tool_venue_title: 'Venue Planner',
  tool_venue_desc: 'Discover and organize your wedding venue requirements.',
  tool_baraat_title: 'Baraat Planner',
  tool_baraat_desc: 'Plan your Baraat transportation and rides.',
  tool_invite_title: 'Wedding Invitation',
  tool_invite_desc: 'Create and manage your wedding invitations.',
  open_tool: 'Open Tool →',
  
  smart_tools_title: 'Smart Wedding Planning Tools 🧠',
  tool_ai_title: 'AI Wedding Planner',
  tool_ai_desc: 'Get personalized wedding planning suggestions.',
  tool_calc_budget_title: 'Budget Calculator',
  tool_calc_budget_desc: 'Calculate your estimated wedding expenses.',
  tool_calc_guest_title: 'Guest Budget Calculator',
  tool_calc_guest_desc: 'Estimate your catering and guest-related costs.',
  tool_tracker_title: 'Wedding Expense Tracker',
  tool_tracker_desc: 'Track your spending and stay within budget.',
  tool_countdown_title: 'Wedding Countdown',
  tool_countdown_desc: 'Count down to your big day.',
  
  bihar_tools_title: 'Plan Your Bihari Wedding ❤️',
  bihar_tools_subtitle: 'Traditional Bihar wedding planning, made simple.',
  bihar_mithila: 'Mithila Wedding Planner',
  bihar_baraat: 'Baraat Planner',
  bihar_dj: 'DJ & Band Planner',
  bihar_catering: 'Bihari Catering Planner',
  bihar_vivah: 'Vivah Bhawan Finder',
  bihar_purohit: 'Purohit / Pandit Finder',
  bihar_madhubani: 'Madhubani Wedding Inspiration',
  bihar_decoration: 'Traditional Decoration Ideas',
  
  journey_title: 'Wedding Planning Journey',
  journey_1: 'Plan',
  journey_2: 'Budget',
  journey_3: 'Find Vendors',
  journey_4: 'Book Services',
  journey_5: 'Manage Guests',
  journey_6: 'Celebrate 🎉',
  
  popular_title: 'Most Popular Wedding Tools 🔥',
  popular_usage: 'Highly Used',
  
  plan_title_auth: 'Your Wedding Plan ❤️',
  plan_progress: 'Wedding Planning Progress',
  plan_tasks_rem: 'Tasks Remaining',
  plan_days_left: 'Days Left',
  plan_cta_continue: 'Continue Planning →',
  
  plan_title_guest: 'Create Your Wedding Plan',
  plan_desc_guest: 'Login karke apni complete wedding planning ek jagah manage karein.',
  plan_cta_start: 'Planning शुरू करें →',
  
  cta_title: 'Your Dream Wedding Starts Here ❤️',
  cta_subtitle: 'Plan. Book. Celebrate.',
  cta_btn_start: 'Planning शुरू करें',
  cta_btn_explore: 'Vendors खोजें',
  
  coming_soon: 'Coming Soon',
  explore: 'Explore'
};

baseEn.footer = footerEn;
baseEn.tools_hub = toolsKeysEn;

baseHi.footer = footerHi;
baseHi.tools_hub = toolsKeysHi;

fs.writeFileSync(enPath, JSON.stringify(baseEn, null, 2));
fs.writeFileSync(hiPath, JSON.stringify(baseHi, null, 2));

console.log('Successfully wrote clean translation files.');
