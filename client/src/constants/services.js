// Centralized ShaadiSaathi Wedding Services Constants
// Reusable across Tools, Homepage, Dashboards, and Navigators

export const STATIC_SERVICES = [
  { name: 'Photography', nameHi: 'फोटोग्राफी (Photography)', icon: '📸', slug: 'photography', to: '/services?category=photography' },
  { name: 'Catering', nameHi: 'कैटरिंग (Catering)', icon: '🍽️', slug: 'catering', to: '/services?category=catering' },
  { name: 'Decoration', nameHi: 'डेकोरेशन (Decoration)', icon: '✨', slug: 'event-planners', to: '/services?category=event-planners' },
  { name: 'Venue', nameHi: 'विवाह भवन (Venue)', icon: '🏛️', slug: 'venues', to: '/services?category=venues' },
  { name: 'Mehndi', nameHi: 'मेहंदी (Mehndi)', icon: '🤲', slug: 'mehndi', to: '/services?category=mehndi' },
  { name: 'Makeup Artist', nameHi: 'ब्राइडल मेकअप (Makeup)', icon: '💄', slug: 'bridal-makeup', to: '/services?category=bridal-makeup' },
  { name: 'Tent House', nameHi: 'टेंट हाउस (Tent House)', icon: '🎪', slug: 'tent-house', to: '/services?category=tent-house' },
  { name: 'Pandit', nameHi: 'पंडित जी (Pandit)', icon: '🕉️', slug: 'pandit', to: '/services?category=pandit' },
  { name: 'DJ', nameHi: 'डीजे और साउंड (DJ)', icon: '🎵', slug: 'dj', to: '/services?category=dj' },
  { name: 'Baraat Ride', nameHi: 'बारात राइड (Baraat Ride)', icon: '🚗', slug: 'baraat-cabs', to: '/baraat-cabs', isSpecial: true }
];

export const getStaticServices = (isEnglish = false) => {
  return STATIC_SERVICES.map((srv) => ({
    ...srv,
    displayName: isEnglish ? srv.name : (srv.nameHi || srv.name),
    cta: isEnglish ? (srv.isSpecial ? 'Explore Baraat Rides →' : 'Explore →') : (srv.isSpecial ? 'बारात राइड देखें →' : 'देखें →'),
    desc: isEnglish ? (srv.descEn || srv.name) : (srv.descHi || srv.name)
  }));
};

export default STATIC_SERVICES;
