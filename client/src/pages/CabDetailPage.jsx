import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMapPin, FiStar, FiUsers, FiCheck, FiShield, FiArrowLeft, FiArrowRight,
  FiChevronLeft, FiChevronRight, FiHeart, FiShare2, FiPhone, FiCalendar,
  FiClock, FiCheckCircle, FiInfo
} from 'react-icons/fi';
import { FaSnowflake, FaUserTie, FaWhatsapp, FaCrown, FaCarSide } from 'react-icons/fa';
import api from '../utils/api';
import { formatPrice, optimizeImage, getInitials, formatDate } from '../utils/helpers';
import StarRating from '../components/common/StarRating';
import ReviewModal from '../components/common/ReviewModal';
import VendorProfileModal from '../components/common/VendorProfileModal';
import { getVehicleFallbackImage } from '../utils/weddingImages';
import SafeImage from '../components/common/SafeImage';
import { toast } from 'react-hot-toast';

export default function CabDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(state => state.auth);

  const [cab, setCab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [similarRides, setSimilarRides] = useState([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [editReviewData, setEditReviewData] = useState(null);
  const [vendorModalOpen, setVendorModalOpen] = useState(false);

  const loadReviews = () => {
    api.get(`/reviews/cab/${id}`)
      .then(r => setReviews(r.data.reviews || []))
      .catch(() => {});
  };

  const loadSimilarRides = async (currentCab) => {
    try {
      const { data } = await api.get('/fleet/browse?');
      const allCabs = data.cabs || data.data || [];
      const similar = allCabs
        .filter(c => c._id !== currentCab._id)
        .slice(0, 3);
      setSimilarRides(similar);
    } catch (err) {
      console.error('Failed loading similar rides:', err);
    }
  };

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/cab-booking/details/${id}`);
        setCab(data.cab);
        if (data.cab.packages && data.cab.packages.length > 0) {
          setSelectedPackage(data.cab.packages[0]);
        }
        loadReviews();
        loadSimilarRides(data.cab);
      } catch (err) {
        toast.error('Baraat ride not found or unavailable');
        navigate('/baraat-cabs');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
    window.scrollTo(0, 0);
  }, [id, navigate]);

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      toast.success('Review deleted successfully');
      loadReviews();
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  const nextImage = () => {
    if (!cab?.images?.length) return;
    setActiveImg((prev) => (prev === cab.images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    if (!cab?.images?.length) return;
    setActiveImg((prev) => (prev === 0 ? cab.images.length - 1 : prev - 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24 bg-[#FDFCF8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-gray-100 border-t-[#D4AF37] rounded-full animate-spin" />
          <p className="text-gray-500 font-bold uppercase text-xs tracking-widest animate-pulse">
            Loading Royal Baraat Vehicle...
          </p>
        </div>
      </div>
    );
  }

  if (!cab) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 bg-[#FDFCF8] px-4">
        <FaCarSide className="text-6xl text-[#D4AF37] mb-6 opacity-80" />
        <h2 className="font-serif text-3xl sm:text-4xl font-black text-gray-900 mb-4 text-center">
          Vehicle Not Found
        </h2>
        <p className="text-gray-500 mb-8 font-medium text-center max-w-md">
          This luxury Baraat vehicle might have been removed or is currently unavailable.
        </p>
        <button
          onClick={() => navigate('/baraat-cabs')}
          className="px-8 py-4 bg-[#0B1021] text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-black transition-colors flex items-center gap-2"
        >
          <FiArrowLeft /> Browse Baraat Rides
        </button>
      </div>
    );
  }

  const handleBookNow = () => {
    if (!cab?._id) return;
    const pkgQuery = selectedPackage ? `&packageId=${selectedPackage._id}` : '';
    navigate(`/baraat-cabs/book?cabId=${cab._id}${pkgQuery}`);
  };

  const handleWhatsApp = () => {
    const vehicleName = cab.name || cab.vehicleName || `${cab.brand || ''} ${cab.model || ''}`;
    const text = `Namaste! I am interested in booking the "${vehicleName}" (Baraat Ride) available on ShaadiSaathi for my wedding. Please share availability details.`;
    window.open(`https://wa.me/919999999999?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleContactVendor = () => {
    if (cab.vendor) {
      setVendorModalOpen(true);
    } else {
      handleWhatsApp();
    }
  };

  const featuresList = [
    { label: 'Chauffeur', value: cab.features?.driverIncluded !== false, icon: '👨‍✈️' },
    { label: 'Floral Decor', value: Boolean(cab.features?.decorationAvailable || cab.additionalServices?.flowerDecoration || cab.isDecorated), icon: '🌸' },
    { label: 'Music System', value: cab.features?.musicSystem !== false, icon: '🎵' },
    { label: 'Climate Control', value: cab.features?.ac !== false, icon: '❄️' },
    { label: 'Fuel Included', value: cab.features?.fuelIncluded !== false, icon: '⛽' },
    { label: 'Verified Partner', value: true, icon: '👑' },
  ];

  const rating = cab.rating?.average || cab.vendor?.rating?.average || 4.9;
  const reviewsCount = cab.rating?.count || cab.vendor?.rating?.count || 120;
  const rawPrice = selectedPackage ? selectedPackage.price : (cab.price || cab.pricing?.baseFare);
  const priceDisplay = rawPrice ? formatPrice(rawPrice) : 'Contact for Price';
  const vehicleName = cab.name || cab.vehicleName || `${cab.brand || 'Luxury'} ${cab.model || 'Baraat Car'}`;
  const cityLocation = cab.location?.city || 'Patna, Bihar';
  const images = (cab.images && cab.images.length > 0) ? cab.images : [{ url: getVehicleFallbackImage(cab.vehicleType || cab.category) }];

  return (
    <div className="min-h-screen bg-[#FDFCF8] pb-32 md:pb-24 selection:bg-[#C2185B]/20 selection:text-[#C2185B] font-sans relative">
      {/* ── TOP BREADCRUMB ── */}
      <div className="pt-28 pb-4 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs font-bold text-gray-500 overflow-x-auto whitespace-nowrap">
            <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <span className="text-gray-300">/</span>
            <Link to="/baraat-cabs" className="hover:text-gray-900 transition-colors">Baraat Ride</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 truncate">{vehicleName}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* =========================================================
            DESKTOP 2-COLUMN MAIN LAYOUT / MOBILE STACK
            ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
          {/* LEFT: Large Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[16/10] bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-lg border border-gray-100 group">
              <SafeImage
                key={activeImg}
                src={optimizeImage(images[activeImg]?.url || getVehicleFallbackImage(cab.vehicleType), 1200)}
                fallbackSrc={getVehicleFallbackImage(cab.vehicleType)}
                alt={`${vehicleName} view ${activeImg + 1}`}
                title={vehicleName}
                categoryIcon="👑"
                aspectRatio="16/10"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-90" />

              {/* Verified Badge Overlay */}
              <div className="absolute top-5 left-5 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm text-gray-900">
                <FiShield className="text-emerald-500" /> Verified Baraat Ride
              </div>

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/40 hover:bg-black/70 backdrop-blur-md rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-white/20"
                    aria-label="Previous image"
                  >
                    <FiChevronLeft size={22} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/40 hover:bg-black/70 backdrop-blur-md rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-white/20"
                    aria-label="Next image"
                  >
                    <FiChevronRight size={22} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Carousel */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImg(index)}
                    className={`relative w-24 h-16 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImg === index ? 'border-[#D4AF37] shadow-md scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <SafeImage
                      src={img.url}
                      fallbackSrc={getVehicleFallbackImage(cab.vehicleType)}
                      alt="thumbnail"
                      title="Thumbnail"
                      categoryIcon="👑"
                      aspectRatio="16/10"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Vehicle Information & Action Panel */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="bg-white rounded-[2.5rem] p-7 sm:p-9 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-amber-50 text-[#D4AF37] px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200/60">
                  {cab.type?.replace('_', ' ') || 'Royal Ceremonial Ride'}
                </span>
                <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Available Now
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-black text-gray-900 mb-3 leading-tight">
                {vehicleName}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-600 mb-6 pb-6 border-b border-gray-100">
                <span className="flex items-center gap-1.5 text-gray-800">
                  <FiMapPin className="text-[#D4AF37]" size={15} /> {cityLocation}
                </span>
                <span className="flex items-center gap-1.5 text-gray-800">
                  <FiUsers className="text-[#C2185B]" size={15} /> {cab.seatingCapacity || 4} Seats
                </span>
                <span className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full text-amber-700">
                  <FiStar className="fill-current text-[#D4AF37]" size={13} />
                  <span>{rating.toFixed(1)}</span>
                  <span className="text-gray-400">({reviewsCount} reviews)</span>
                </span>
              </div>

              {/* Price Display */}
              <div className="mb-8">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                  {selectedPackage ? selectedPackage.name : 'Starting Price'}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif font-black text-3xl sm:text-4xl text-gray-900">
                    {priceDisplay}
                  </span>
                  {rawPrice && (
                    <span className="text-xs text-gray-500 font-medium">/ ceremonial booking</span>
                  )}
                </div>
              </div>

              {/* Packages Selection (if packages exist) */}
              {cab.packages && cab.packages.length > 0 && (
                <div className="mb-8">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">
                    Select Rental Package
                  </label>
                  <div className="space-y-2.5">
                    {cab.packages.map((pkg) => (
                      <div
                        key={pkg._id}
                        onClick={() => setSelectedPackage(pkg)}
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                          selectedPackage?._id === pkg._id
                            ? 'bg-amber-50/50 border-[#D4AF37] shadow-xs'
                            : 'bg-gray-50 border-gray-200/70 hover:border-gray-300'
                        }`}
                      >
                        <div>
                          <p className="font-black text-xs text-gray-900">{pkg.name}</p>
                          <p className="text-[10px] text-gray-500 font-bold">{pkg.hours} hrs • {pkg.kmLimit} km limit</p>
                        </div>
                        <span className="font-bold text-sm text-gray-900">{formatPrice(pkg.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleBookNow}
                  className="w-full bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#B38D22] text-[#0B1021] py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_10px_25px_rgba(212,175,55,0.3)] hover:shadow-[0_15px_30px_rgba(212,175,55,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[48px]"
                >
                  Book This Ride &rarr;
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleContactVendor}
                    className="w-full bg-gray-100 text-gray-800 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    <FiPhone /> Contact Vendor
                  </button>
                  <button
                    onClick={handleWhatsApp}
                    className="w-full bg-[#25D366] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#20b858] active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    <FaWhatsapp size={16} /> WhatsApp Vendor
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-center gap-2 text-[11px] font-bold text-emerald-700 bg-emerald-50/70 py-2.5 rounded-xl">
                <FiShield /> 100% Verified &amp; Insured Wedding Transportation
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            BELOW SECTIONS (ABOUT, FEATURES, GALLERY, VENDOR, REVIEWS, SIMILAR)
            ========================================================= */}

        {/* 1. ABOUT VEHICLE */}
        <div className="mb-12 bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-sm border border-gray-100">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-[#D4AF37] block mb-2">THE EXPERIENCE</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-black text-gray-900 mb-4">
            About this {cab.brand || 'Royal'} {cab.model || 'Vehicle'}
          </h2>
          <p className="text-gray-600 font-medium leading-relaxed text-base sm:text-lg whitespace-pre-wrap">
            {cab.description ||
              "Experience the pinnacle of luxury with this impeccably maintained vehicle. Designed to offer maximum comfort and a commanding presence, it is the perfect choice for the groom's ceremonial arrival or the bridal party's grand entrance. Equipped with premium leather interiors, advanced climate control, and a state-of-the-art sound system, every journey becomes a royal celebration."}
          </p>
        </div>

        {/* 2. FEATURES & AMENITIES */}
        <div className="mb-12 bg-[#0B1021] rounded-[2.5rem] p-8 sm:p-12 shadow-xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-[90px] pointer-events-none" />
          <h2 className="font-serif text-2xl sm:text-3xl font-black mb-6 relative z-10">
            Included Services &amp; Amenities
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 relative z-10">
            {featuresList.map((f, i) => (
              <div
                key={i}
                className={`p-5 rounded-2xl border transition-all flex flex-col items-center text-center ${
                  f.value ? 'bg-white/10 border-white/20 backdrop-blur-md' : 'bg-black/20 border-white/5 opacity-50'
                }`}
              >
                <span className="text-3xl mb-3 block">{f.icon}</span>
                <p className="text-xs font-black uppercase tracking-widest text-white leading-tight">{f.label}</p>
                {f.value && (
                  <div className="mt-2.5 w-5 h-5 bg-[#D4AF37] rounded-full flex items-center justify-center">
                    <FiCheck className="text-black text-xs" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 3. GALLERY SECTION */}
        <div className="mb-12">
          <h2 className="font-serif text-2xl sm:text-3xl font-black text-gray-900 mb-6">
            Vehicle Gallery
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((img, i) => (
              <div
                key={i}
                onClick={() => setActiveImg(i)}
                className="cursor-pointer group relative aspect-[4/3] rounded-3xl overflow-hidden bg-gray-100 border border-gray-100 shadow-xs"
              >
                <img
                  src={img.url}
                  alt={`Gallery view ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 4. VENDOR INFORMATION */}
        {cab.vendor && (
          <div className="mb-12 bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-gray-50 border-2 border-[#D4AF37] p-0.5 shadow-sm shrink-0">
                <img
                  src={cab.vendor.images?.[0]?.url || `https://ui-avatars.com/api/?name=${cab.vendor.businessName}&background=random`}
                  className="w-full h-full rounded-full object-cover"
                  alt={cab.vendor.businessName}
                />
              </div>
              <div>
                <span className="bg-amber-50 text-[#D4AF37] px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest inline-block mb-1">
                  Verified Fleet Partner
                </span>
                <h3 className="font-serif font-black text-xl sm:text-2xl text-gray-900">
                  {cab.vendor.businessName}
                </h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Partner in {cab.vendor.city || cityLocation} • {reviewsCount} completed Baraat bookings
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setVendorModalOpen(true)}
                className="w-full sm:w-auto bg-gray-100 text-gray-900 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all min-h-[44px]"
              >
                View Profile
              </button>
            </div>
          </div>
        )}

        {/* 5. REVIEWS SECTION */}
        <div className="mb-16 bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-black text-gray-900">Guest Reviews</h2>
              <p className="text-xs text-gray-500 font-medium mt-1">Real wedding experiences from ShaadiSaathi couples</p>
            </div>
            {isAuthenticated && (
              <button
                onClick={() => setReviewModalOpen(true)}
                className="bg-[#0B1021] text-white py-3 px-6 rounded-full font-black text-xs uppercase tracking-widest hover:bg-black transition-all min-h-[44px]"
              >
                Write a Review
              </button>
            )}
          </div>

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500 font-bold text-sm">No reviews yet. Be the first to book and share your grand Baraat experience!</p>
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev._id} className="p-6 rounded-2xl bg-gray-50/60 border border-gray-100 relative">
                  {user?._id === rev.user?._id && (
                    <div className="absolute top-4 right-4 flex gap-3 bg-white px-3 py-1 rounded-full shadow-xs border border-gray-100">
                      <button
                        onClick={() => { setEditReviewData(rev); setReviewModalOpen(true); }}
                        className="text-blue-600 text-[10px] font-black uppercase hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteReview(rev._id)}
                        className="text-red-600 text-[10px] font-black uppercase hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-black text-[#0B1021] border border-gray-200">
                        {getInitials(rev.user?.name)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{rev.user?.name}</p>
                        <p className="text-xs text-gray-400 font-medium">{formatDate(rev.createdAt)}</p>
                      </div>
                    </div>
                    <StarRating rating={rev.rating} size="sm" showCount={false} />
                  </div>
                  <p className="text-gray-600 text-sm font-medium leading-relaxed italic">"{rev.comment}"</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 6. BOOKING INFORMATION */}
        <div className="mb-16 bg-amber-50/50 rounded-[2.5rem] p-8 sm:p-10 border border-amber-200/60">
          <h3 className="font-serif font-black text-xl text-gray-900 mb-4">
            Baraat Booking Guidelines &amp; Policies
          </h3>
          <ul className="space-y-2.5 text-xs sm:text-sm text-gray-700 font-medium">
            <li className="flex items-start gap-2">
              <FiCheckCircle className="text-emerald-600 text-base shrink-0 mt-0.5" />
              <span><strong>Ceremonial Hours &amp; Distance:</strong> Base package covers 8 hours and up to 80 km within the city. Additional hours/km are billed at standard partner rates.</span>
            </li>
            <li className="flex items-start gap-2">
              <FiCheckCircle className="text-emerald-600 text-base shrink-0 mt-0.5" />
              <span><strong>Floral Decoration:</strong> Custom flower arrangements can be added during booking checkout or coordinated directly with the vendor.</span>
            </li>
            <li className="flex items-start gap-2">
              <FiCheckCircle className="text-emerald-600 text-base shrink-0 mt-0.5" />
              <span><strong>Transparent Cancellation:</strong> Full refund available if cancelled up to 7 days prior to the wedding date.</span>
            </li>
          </ul>
        </div>

        {/* 7. SIMILAR RIDES */}
        {similarRides.length > 0 && (
          <div className="mb-20">
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-gray-900 mb-6">
              Similar Baraat Rides
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {similarRides.map(sim => (
                <div
                  key={sim._id}
                  onClick={() => navigate(`/baraat-cabs/details/${sim._id}`)}
                  className="cursor-pointer group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-xs hover:shadow-xl transition-all flex flex-col"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                    <SafeImage
                      src={sim.images?.[0]?.url || getVehicleFallbackImage(sim.vehicleType)}
                      fallbackSrc={getVehicleFallbackImage(sim.vehicleType)}
                      alt={sim.name}
                      title={sim.name}
                      categoryIcon="🚗"
                      aspectRatio="16/10"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-black uppercase">
                      Verified
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1 justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-lg text-gray-900 group-hover:text-[#C2185B] transition-colors">
                        {sim.name || sim.vehicleName}
                      </h4>
                      <p className="text-xs text-gray-500 font-medium mt-1">
                        {sim.seatingCapacity || 4} Seater • {sim.location?.city || 'Patna'}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="font-serif font-black text-base text-gray-900">
                        {sim.price || sim.pricing?.baseFare ? formatPrice(sim.price || sim.pricing?.baseFare) : 'Contact for Price'}
                      </span>
                      <span className="text-xs font-bold text-[#D4AF37] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        View &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── MOBILE FIXED STICKY BOTTOM BAR (WITH SAFE AREA SPACING) ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 p-4 pb-safe lg:hidden z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] flex gap-3">
        <button
          onClick={handleWhatsApp}
          className="w-12 h-12 shrink-0 bg-[#25D366] text-white rounded-2xl flex items-center justify-center shadow-md active:scale-95 transition-transform"
          aria-label="WhatsApp vendor"
        >
          <FaWhatsapp size={22} />
        </button>
        <button
          onClick={handleBookNow}
          className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#B38D22] text-[#0B1021] rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-between px-6 active:scale-95 transition-transform min-h-[48px]"
        >
          <div className="text-left flex flex-col justify-center">
            <span className="text-[9px] opacity-80 uppercase tracking-widest font-black">Starting Price</span>
            <span className="font-serif text-base font-black">{priceDisplay}</span>
          </div>
          <span className="flex items-center gap-1.5 font-black">
            Book Now <FiArrowRight />
          </span>
        </button>
      </div>

      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => { setReviewModalOpen(false); setEditReviewData(null); }}
        targetId={id}
        targetType="cab"
        existingReview={editReviewData}
        onSuccess={() => {
          loadReviews();
          api.get(`/cab-booking/details/${id}`).then(r => setCab(r.data.cab)).catch(() => {});
        }}
      />

      <VendorProfileModal
        isOpen={vendorModalOpen}
        onClose={() => setVendorModalOpen(false)}
        vendor={cab?.vendor}
      />
    </div>
  );
}
