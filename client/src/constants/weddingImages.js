// ── 1. HOME PAGE HERO IMAGES ───────────────────────────────────────────────
export const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1587271636175-90d58cdad458?auto=format&fit=crop&w=1600&q=80', // Indian Wedding Mandap & Marigold Decor
  'https://i.pinimg.com/736x/a2/3b/c3/a23bc31976de5d1689fcf8f16b462c6c.jpg', // Indian Bride & Groom Royal Ceremony
  'https://i.pinimg.com/736x/b2/d2/d2/b2d2d250f0113b95829fab278cb35b41.jpg', // Heritage Palace Wedding Banquet
  'https://i.pinimg.com/736x/29/d5/b6/29d5b6fc95c65a588cf6db6c19296b65.jpg', // Grand Wedding Floral Stage & Lights
  'https://i.pinimg.com/1200x/79/9b/7a/799b7a8e873209add1041f807dbc4c8c.jpg', // Traditional Indian Couple Celebration
];

// ── 2. SERVICE CATEGORY VISUAL IMAGES ──────────────────────────────────────
export const CATEGORY_IMAGES = {
  photography: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80', // Candid wedding photographer
  catering: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80', // Gourmet Indian wedding feast & thali
  'event-planners': 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80', // Marigold & floral mandap decoration
  venues: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80', // Royal marriage palace & banquet hall
  mehndi: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80', // Intricate bridal mehndi henna hands
  'bridal-makeup': 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80', // Indian bridal makeup & styling
  'tent-house': 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80', // Grand wedding shamiana lighting & drapery
  pandit: 'https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&w=800&q=80', // Traditional Vedic ritual diya / kalash
  dj: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80', // Sangeet party & DJ sound lighting
  'baraat-cabs': 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80', // Luxury wedding car with ribbons
  default: 'https://images.unsplash.com/photo-1587271636175-90d58cdad458?auto=format&fit=crop&w=800&q=80',
};

/**
 * Returns an elegant, high-quality royalty-free fallback image for a vendor category
 */
export const getCategoryFallbackImage = (categorySlugOrName) => {
  if (!categorySlugOrName) return CATEGORY_IMAGES.default;
  const key = String(categorySlugOrName).toLowerCase().trim();
  if (CATEGORY_IMAGES[key]) return CATEGORY_IMAGES[key];

  if (key.includes('photo') || key.includes('video')) return CATEGORY_IMAGES.photography;
  if (key.includes('cater') || key.includes('food') || key.includes('thali')) return CATEGORY_IMAGES.catering;
  if (key.includes('decor') || key.includes('plan') || key.includes('event') || key.includes('florist')) return CATEGORY_IMAGES['event-planners'];
  if (key.includes('venue') || key.includes('hall') || key.includes('resort') || key.includes('banquet') || key.includes('lawn')) return CATEGORY_IMAGES.venues;
  if (key.includes('mehndi') || key.includes('henna')) return CATEGORY_IMAGES.mehndi;
  if (key.includes('makeup') || key.includes('beauty') || key.includes('bridal') || key.includes('salon')) return CATEGORY_IMAGES['bridal-makeup'];
  if (key.includes('tent') || key.includes('light') || key.includes('sound')) return CATEGORY_IMAGES['tent-house'];
  if (key.includes('pandit') || key.includes('priest') || key.includes('pooja')) return CATEGORY_IMAGES.pandit;
  if (key.includes('dj') || key.includes('music') || key.includes('band')) return CATEGORY_IMAGES.dj;
  if (key.includes('cab') || key.includes('car') || key.includes('ride') || key.includes('transport') || key.includes('baraat')) return CATEGORY_IMAGES['baraat-cabs'];

  return CATEGORY_IMAGES.default;
};

// ── 3. BARAAT VEHICLES & TRANSPORTATION ────────────────────────────────────
export const BARAAT_VEHICLE_IMAGES = {
  sedan: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80', // Executive Sedan
  suv: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80', // Premium SUV
  luxury_car: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80', // Luxury Mercedes/BMW
  vintage_car: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80', // Classic Vintage / Royal Car
  bus: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80', // Baraat Coach / Bus
  tempo_traveller: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80', // Luxury AC 12-20 seater
  horse_carriage: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80', // Ceremonial Baraat Procession
};

export const BARAAT_RIDE_CATEGORIES = [
  {
    id: "Luxury Cars",
    title: "Luxury Cars",
    name: "Luxury Cars",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
    icon: "🚘",
    description: "Mercedes, Audi, BMW Executive Sedans",
    types: ['sedan', 'luxury_car']
  },
  {
    id: "Royal Cars",
    title: "Royal Cars",
    name: "Royal Cars",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
    icon: "👑",
    description: "Vintage classics & regal ceremonial vehicles",
    types: ['vintage_car', 'royal_car']
  },
  {
    id: "Premium SUVs",
    title: "Premium SUVs",
    name: "Premium SUVs",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=800&q=80",
    icon: "🚙",
    description: "Fortuner, Endeavour & spacious luxury SUVs",
    types: ['suv']
  },
  {
    id: "Tempo Traveller",
    title: "Tempo Traveller",
    name: "Tempo Traveller",
    image: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80",
    icon: "🚐",
    description: "12-20 seater luxury AC travellers for guests",
    types: ['tempo_traveller']
  },
  {
    id: "Baraat Bus",
    title: "Baraat Bus",
    name: "Baraat Bus",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80",
    icon: "🚌",
    description: "Premium luxury AC coaches for wedding procession",
    types: ['bus']
  },
  {
    id: "Decorated Vehicles",
    title: "Decorated Vehicles",
    name: "Decorated Vehicles",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
    icon: "🎉",
    description: "Pre-decorated with fresh flowers & royal lights",
    filterSpecial: 'decorated'
  },
  {
    id: "Traditional Baraat",
    title: "Traditional Baraat",
    name: "Traditional Baraat",
    image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
    icon: "🐎",
    description: "Royal Baggi & Ceremonial Procession vehicles",
    types: ['horse_carriage', 'special']
  }
];

export const getVehicleFallbackImage = (vehicleType) => {
  if (!vehicleType) return BARAAT_VEHICLE_IMAGES.luxury_car;
  const key = String(vehicleType).toLowerCase().trim();
  if (BARAAT_VEHICLE_IMAGES[key]) return BARAAT_VEHICLE_IMAGES[key];

  if (key.includes('vintage') || key.includes('classic') || key.includes('royal')) return BARAAT_VEHICLE_IMAGES.vintage_car;
  if (key.includes('suv') || key.includes('fortuner')) return BARAAT_VEHICLE_IMAGES.suv;
  if (key.includes('horse') || key.includes('carriage') || key.includes('baggi') || key.includes('traditional')) return BARAAT_VEHICLE_IMAGES.horse_carriage;
  if (key.includes('tempo') || key.includes('traveller') || key.includes('van')) return BARAAT_VEHICLE_IMAGES.tempo_traveller;
  if (key.includes('bus') || key.includes('coach')) return BARAAT_VEHICLE_IMAGES.bus;
  if (key.includes('sedan')) return BARAAT_VEHICLE_IMAGES.sedan;

  return BARAAT_VEHICLE_IMAGES.luxury_car;
};

// ── 4. WEDDING PACKAGES & CELEBRATIONS ─────────────────────────────────────
export const PACKAGE_IMAGES = {
  silver: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80', // Intimate elegant ceremony
  gold: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80', // Complete Indian wedding celebration
  royal: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80', // Grand palace banquet & stage decor
  customBanner: 'https://images.unsplash.com/photo-1610173827002-62804b46c05d?auto=format&fit=crop&w=1600&q=80', // Custom tailored wedding package background
};

// ── 5. INVITATION GENERATOR TEMPLATES ──────────────────────────────────────
export const INVITATION_TEMPLATE_IMAGES = [
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80', // Traditional Red & Gold
  'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=600&q=80', // Modern Gold Scroll
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80', // Royal Heritage Palace
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80', // Minimal Ivory Elegance
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80', // Luxury Velvet Maroon
  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=80', // Floral Garden Marigold
  'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=600&q=80', // Mithila Madhubani Bihar Art Motif
  'https://images.unsplash.com/photo-1587271636175-90d58cdad458?auto=format&fit=crop&w=600&q=80', // Elegant Mandala Vedic
];

// ── 6. WEDDING PLANNING TOOLS VISUALS ──────────────────────────────────────
export const TOOLS_IMAGES = {
  'wedding-planner': 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
  'timeline': 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
  'venue-planner': 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80',
  'shubh-muhurat': 'https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&w=800&q=80',
  'kundli-matching': 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
  'budget-planner': 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80',
  'guest-list': 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
  'ai-planner': 'https://images.unsplash.com/photo-1587271636175-90d58cdad458?auto=format&fit=crop&w=800&q=80',
  'checklist': 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80',
  'gallery': 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
};

export const getToolImage = (toolId) => {
  return TOOLS_IMAGES[toolId] || TOOLS_IMAGES['wedding-planner'];
};

// ── 7. ABOUT US & BIHAR CULTURE VISUALS ────────────────────────────────────
export const ABOUT_IMAGES = {
  heroBg: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=80',
  celebration: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1000&q=80',
  madhubaniArt: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80',
};

// ── 8. BECOME A VENDOR PROFESSIONAL IMAGES ─────────────────────────────────
export const VENDOR_REGISTER_IMAGES = {
  heroPhoto: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=600&q=80',
  workGallery: [
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=400&q=80',
  ],
};
