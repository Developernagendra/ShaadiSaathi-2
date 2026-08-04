export const formatPrice = (price) => {
  if (!price && price !== 0) return 'Price unavailable'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price)
}

export const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

export const formatDateShort = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const formatTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  const intervals = [
    { label: 'year', secs: 31536000 }, { label: 'month', secs: 2592000 },
    { label: 'week', secs: 604800 }, { label: 'day', secs: 86400 },
    { label: 'hour', secs: 3600 }, { label: 'minute', secs: 60 },
  ]
  for (const { label, secs } of intervals) {
    const n = Math.floor(seconds / secs)
    if (n >= 1) return `${n} ${label}${n > 1 ? 's' : ''} ago`
  }
  return 'Just now'
}

export const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export const truncate = (str, length = 100) => {
  if (!str) return ''
  return str.length > length ? str.slice(0, length) + '...' : str
}

export const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    refunded: 'bg-gray-100 text-gray-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    suspended: 'bg-orange-100 text-orange-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

export const INDIAN_CITIES = [
  'Patna', 'Gaya', 'Muzaffarpur', 'Darbhanga', 'Bhagalpur', 'Purnia',
  'Bihar Sharif', 'Begusarai', 'Katihar', 'Ara', 'Samastipur', 'Motihari',
  'Sitamarhi', 'Hajipur', 'Chapra', 'Sasaram', 'Siwan', 'Bettiah',
  'Madhubani', 'Munger'
]

import { BARAAT_VEHICLE_IMAGES } from './weddingImages';

export const VEHICLE_TYPES = [
  { value: 'sedan', label: 'Executive Sedan', icon: '🚗', capacity: 4, desc: 'Ideal for small families', rating: 4.8, baseRate: 15, image: BARAAT_VEHICLE_IMAGES.sedan },
  { value: 'suv', label: 'Luxury SUV', icon: '🚙', capacity: 7, desc: 'Spacious & Comfortable', rating: 4.9, baseRate: 22, image: BARAAT_VEHICLE_IMAGES.suv },
  { value: 'luxury_car', label: 'Premium Luxury', icon: '🏎️', capacity: 4, desc: 'BMW, Audi, Mercedes', rating: 5.0, baseRate: 45, image: BARAAT_VEHICLE_IMAGES.luxury_car },
  { value: 'vintage_car', label: 'Vintage Classic', icon: '📽️', capacity: 2, desc: 'Classic royal look', rating: 4.9, baseRate: 150, image: BARAAT_VEHICLE_IMAGES.vintage_car },
  { value: 'bus', label: 'Luxury Bus', icon: '🚌', capacity: 45, desc: 'Ideal for guests', rating: 4.7, baseRate: 85, image: BARAAT_VEHICLE_IMAGES.bus },
  { value: 'tempo_traveller', label: 'Tempo Traveller', icon: '🚐', capacity: 17, desc: 'The baraat favorite', rating: 4.8, baseRate: 35, image: BARAAT_VEHICLE_IMAGES.tempo_traveller },
  { value: 'horse_carriage', label: 'Horse Carriage', icon: '🎠', capacity: 4, desc: 'The royal wedding entry', rating: 5.0, baseRate: 200, image: BARAAT_VEHICLE_IMAGES.horse_carriage },
]

export const optimizeImage = (url, width = 800) => {
  if (!url) return ''
  if (url.includes('cloudinary.com')) {
    return url.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`)
  }
  if (url.includes('unsplash.com')) {
    return `${url.split('?')[0]}?w=${width}&q=80&auto=format`
  }
  return url
}

export const getWhatsAppLink = (phone, defaultText = "Hi, I found your service on ShaadiSaathi and would like to book your service.") => {
  if (!phone) return null;
  
  // Remove all non-numeric characters
  let cleanPhone = String(phone).replace(/\D/g, '');
  
  // If it's a 10 digit Indian number, add 91
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }
  
  // Check validity length
  if (cleanPhone.length < 10) return null;

  const encodedText = encodeURIComponent(defaultText);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
};
