const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'client/public/locales/en/translation.json');
const hiPath = path.join(__dirname, 'client/public/locales/hi/translation.json');

const weddingPlannerEn = {
  "hero_title": "Plan Your Bihari Wedding ❤️",
  "hero_subtitle": "Traditional Bihar wedding planning, made simple.",
  "create_plan_btn": "Create Wedding Plan",
  "create_plan_wizard": "Wedding Plan Setup",
  "bride_name": "Bride Name",
  "groom_name": "Groom Name",
  "wedding_date": "Wedding Date",
  "city": "Wedding City",
  "district": "District",
  "venue": "Wedding Venue",
  "budget": "Wedding Budget",
  "guest_count": "Expected Guest Count",
  "wedding_type": "Wedding Type",
  "region": "Bihar Region",
  "submit_plan": "Start Planning",
  "dashboard": "Wedding Dashboard",
  "countdown": "Days To Go",
  "progress": "Planning Progress",
  "budget_title": "Budget Planner",
  "guests_title": "Guest List",
  "vendors_title": "Vendors",
  "tasks_title": "Tasks",
  "upcoming_events": "Upcoming Events",
  "timeline_tab": "Timeline",
  "budget_tab": "Budget",
  "guests_tab": "Guests",
  "checklist_tab": "Checklist",
  "vendors_tab": "Recommendations",
  "book_vendor": "Book Vendor",
  "add_guest": "Add Guest",
  "add_task": "Add Task",
  "mark_completed": "Mark Completed",
  "no_active_plan": "You do not have an active wedding plan. Create one to get started!",
  "total_budget": "Total Estimated",
  "actual_cost": "Total Actual",
  "paid_amount": "Total Paid",
  "budget_used": "Budget Used",
  "confirmed_guests": "Confirmed Guests"
};

const weddingPlannerHi = {
  "hero_title": "अपनी बिहारी शादी की प्लानिंग करें ❤️",
  "hero_subtitle": "पारंपरिक बिहार शादी की तैयारी, अब हुई आसान।",
  "create_plan_btn": "शादी का प्लान बनाएं",
  "create_plan_wizard": "Wedding Plan Setup",
  "bride_name": "दुल्हन का नाम",
  "groom_name": "दूल्हे का नाम",
  "wedding_date": "शादी की तारीख",
  "city": "शादी का शहर",
  "district": "ज़िला",
  "venue": "शादी का स्थान (Venue)",
  "budget": "शादी का बजट",
  "guest_count": "अपेक्षित मेहमान",
  "wedding_type": "शादी का प्रकार",
  "region": "बिहार का क्षेत्र",
  "submit_plan": "प्लानिंग शुरू करें",
  "dashboard": "वेडिंग डैशबोर्ड",
  "countdown": "दिन बाकी",
  "progress": "प्लानिंग प्रोग्रेस",
  "budget_title": "बजट प्लानर",
  "guests_title": "मेहमानों की सूची",
  "vendors_title": "वेंडर्स",
  "tasks_title": "टास्क",
  "upcoming_events": "आने वाले कार्यक्रम",
  "timeline_tab": "टाइमलाइन",
  "budget_tab": "बजट",
  "guests_tab": "मेहमान",
  "checklist_tab": "चेकलिस्ट",
  "vendors_tab": "सुझाए गए वेंडर्स",
  "book_vendor": "वेंडर बुक करें",
  "add_guest": "मेहमान जोड़ें",
  "add_task": "टास्क जोड़ें",
  "mark_completed": "पूरा हुआ",
  "no_active_plan": "आपका कोई एक्टिव वेडिंग प्लान नहीं है। शुरुआत करने के लिए नया प्लान बनाएं!",
  "total_budget": "कुल अनुमानित बजट",
  "actual_cost": "वास्तविक खर्च",
  "paid_amount": "कुल भुगतान",
  "budget_used": "बजट इस्तेमाल हुआ",
  "confirmed_guests": "कन्फर्म मेहमान"
};

function updateTranslations() {
  const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const hiData = JSON.parse(fs.readFileSync(hiPath, 'utf8'));

  enData.wedding_planner = weddingPlannerEn;
  hiData.wedding_planner = weddingPlannerHi;

  fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));
  fs.writeFileSync(hiPath, JSON.stringify(hiData, null, 2));
  
  console.log('Successfully updated translation.json files.');
}

updateTranslations();
