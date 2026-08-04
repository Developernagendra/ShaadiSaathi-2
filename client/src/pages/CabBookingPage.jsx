import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  FiCheck, FiMapPin, FiCalendar, FiClock, FiUsers, FiArrowRight,
  FiArrowLeft, FiZap, FiUser, FiPhone, FiShield, FiInfo
} from 'react-icons/fi';
import { FaCrown, FaWhatsapp, FaCarSide } from 'react-icons/fa';
import { formatPrice } from '../utils/helpers';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import LoadingScreen from '../components/common/LoadingScreen';
import BookingStatusBadge from '../components/booking/BookingStatusBadge';
import { motion, AnimatePresence } from 'framer-motion';
import { getVehicleFallbackImage } from '../utils/weddingImages';

export default function CabBookingPage() {
  const { id } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const cabId = id || searchParams.get('cabId');
  const packageId = searchParams.get('packageId');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector(s => s.auth);

  const [cab, setCab] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState(null);

  // Fleet Builder State compatibility
  const stateData = location.state || {};
  const isFleetBuilder = stateData.bookingType === 'baraat-fleet';
  const fleetSelection = stateData.fleetSelection || [];

  const [form, setForm] = useState({
    city: stateData.city || searchParams.get('city') || '',
    pickupLocation: searchParams.get('pickup') || '',
    dropLocation: searchParams.get('drop') || '',
    guestCount: stateData.guestCount || searchParams.get('guests') || '',
    eventDate: stateData.eventDate || searchParams.get('date') || '',
    eventTime: searchParams.get('time') || '',
    contactName: searchParams.get('name') || user?.name || '',
    contactPhone: searchParams.get('phone') || user?.phone || '',
    message: ''
  });

  useEffect(() => {
    if (user && user.role !== 'user') {
      toast.error('Only users can book Baraat rides');
      navigate('/baraat-cabs');
      return;
    }

    if (!cabId && !isFleetBuilder) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        if (isFleetBuilder) {
          setLoading(false);
        } else if (cabId) {
          const { data } = await api.get(`/cab-booking/details/${cabId}`);
          setCab(data.cab);
          setVendor(data.cab.vendor || null);
          setForm(f => ({
            ...f,
            city: f.city || data.cab.location?.city || '',
            guestCount: f.guestCount || String(data.cab.seatingCapacity || 4)
          }));
          if (packageId && data.cab.packages) {
            const pkg = data.cab.packages.find(p => p._id === packageId);
            if (pkg) setSelectedPackage(pkg);
          }
          setLoading(false);
        }
      } catch (err) {
        toast.error('Failed to load Baraat ride details');
        navigate('/baraat-cabs');
      }
    };
    fetchData();
  }, [cabId, isFleetBuilder, packageId, navigate, user]);

  const baseFare = isFleetBuilder
    ? stateData.totalAmount
    : (selectedPackage ? selectedPackage.price : (cab?.price || cab?.pricing?.baseFare || 0));
  const subtotal = Number(baseFare || 0);
  const gst = Math.round(subtotal * 0.05);
  const totalAmount = subtotal + gst;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!user) {
      toast.error('Please login to book a Baraat ride');
      navigate('/login', { state: { from: location } });
      return;
    }

    if (!form.eventDate || !form.pickupLocation || !form.contactPhone) {
      toast.error('Please fill in Date, Pickup location, and Contact Phone.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        bookingType: isFleetBuilder ? 'baraat-fleet' : 'cab',
        fleetSelection: isFleetBuilder ? fleetSelection : undefined,
        cabId: cab?._id,
        city: form.city,
        pickupLocation: form.pickupLocation,
        dropLocation: form.dropLocation,
        guestCount: Number(form.guestCount) || (cab ? cab.seatingCapacity : 4),
        eventDate: form.eventDate,
        eventTime: form.eventTime,
        contactName: form.contactName,
        contactPhone: form.contactPhone,
        message: form.message,
        totalAmount
      };

      if (!isFleetBuilder && selectedPackage) {
        payload.packageId = selectedPackage._id;
        payload.packageType = 'package';
      } else if (!isFleetBuilder) {
        payload.packageType = 'custom';
      }

      const { data } = await api.post('/cab-booking', payload);

      setSuccess(true);
      setCreatedBookingId(data.booking?._id || data.bookingId);
      toast.success('Baraat ride booking submitted successfully!');
    } catch (err) {
      console.error('Booking submission error:', err);
      toast.error(err.message || err.response?.data?.message || 'Failed to submit booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingScreen />;

  if (!cabId && !isFleetBuilder) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-4 relative">
        <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full text-center shadow-lg border border-gray-100">
          <FaCarSide className="text-5xl text-[#D4AF37] mx-auto mb-5" />
          <h2 className="font-serif font-black text-2xl text-gray-900 mb-3">Vehicle Not Selected</h2>
          <p className="text-gray-500 font-medium mb-8 text-sm">
            Please choose a Baraat ride from our fleet collection to proceed with booking.
          </p>
          <button
            onClick={() => navigate('/baraat-cabs')}
            className="px-8 py-4 bg-[#0B1021] text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-md"
          >
            Browse Baraat Rides
          </button>
        </div>
      </div>
    );
  }

  // --- 10. SUCCESS SCREEN WITH DYNAMIC BOOKING STATUS UI ---
  if (success) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-4 pt-28 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#C2185B]/10 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[3rem] p-8 sm:p-14 max-w-2xl w-full text-center shadow-2xl border border-gray-100 relative z-10"
        >
          <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-amber-200">
            <FaCrown className="text-[#D4AF37] text-4xl" />
          </div>

          <div className="mb-4 flex justify-center">
            {/* Using our reusable BookingStatusBadge component */}
            <BookingStatusBadge status="pending" size="lg" />
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-black text-gray-900 mb-4">
            Reservation Request Confirmed! 👑
          </h1>
          <p className="text-gray-500 mb-8 leading-relaxed text-sm sm:text-base max-w-lg mx-auto">
            Your Baraat ride booking request for{' '}
            <strong className="text-gray-900">{cab?.name || 'Your Selected Ride'}</strong> has been sent to our verified fleet partner. You will receive an update via WhatsApp &amp; SMS shortly.
          </p>

          <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left border border-gray-100 max-w-md mx-auto">
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200 text-xs">
              <span className="text-gray-500 font-bold">Booking ID</span>
              <span className="font-mono font-bold text-gray-900">#{String(createdBookingId || 'BR-2026').slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center mb-3 text-xs">
              <span className="text-gray-500 font-bold">Wedding Date</span>
              <span className="font-bold text-gray-900">{form.eventDate || 'Scheduled'}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 font-bold">Total Estimated Amount</span>
              <span className="font-black text-[#0B1021]">{formatPrice(totalAmount)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard/my-bookings')}
              className="px-8 py-4 bg-[#0B1021] text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-md min-h-[44px]"
            >
              Manage My Bookings
            </button>
            <button
              onClick={() => navigate('/baraat-cabs')}
              className="px-8 py-4 bg-gray-100 text-gray-800 rounded-full font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all min-h-[44px]"
            >
              Browse More Rides
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const vehicleName = cab?.name || cab?.vehicleName || `${cab?.brand || 'Luxury'} ${cab?.model || 'Baraat Car'}`;
  const image = cab?.images?.[0]?.url || getVehicleFallbackImage(cab?.vehicleType || cab?.category);

  return (
    <div className="min-h-screen bg-[#FDFCF8] font-sans pt-28 pb-24 selection:bg-[#C2185B]/20 selection:text-[#C2185B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to={cab ? `/baraat-cabs/details/${cab._id}` : '/baraat-cabs'}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        >
          <FiArrowLeft /> Back to Vehicle Details
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* =========================================================
              LEFT / TOP: BOOKING SUMMARY CARD
              ========================================================= */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="bg-white rounded-[2.5rem] p-7 sm:p-8 shadow-sm border border-gray-100 sticky top-28">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] block mb-2">
                ROYAL BOOKING SUMMARY
              </span>
              <h2 className="font-serif font-black text-2xl text-gray-900 mb-6">
                Your Baraat Ride
              </h2>

              {/* Selected Vehicle Mini Preview */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 mb-6">
                <div className="w-20 h-14 rounded-xl overflow-hidden bg-gray-200 shrink-0">
                  <img src={image} alt={vehicleName} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest block">
                    {cab?.type?.replace('_', ' ') || 'Ceremonial Ride'}
                  </span>
                  <h3 className="font-bold text-gray-900 text-sm truncate">{vehicleName}</h3>
                  <p className="text-xs text-gray-500 font-medium">{cab?.location?.city || 'Patna, Bihar'}</p>
                </div>
              </div>

              {/* Booking Specifications Summary */}
              <div className="space-y-3 pb-6 border-b border-gray-100 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium flex items-center gap-1.5">
                    <FiCalendar className="text-[#D4AF37]" /> Wedding Date
                  </span>
                  <span className="font-bold text-gray-900">{form.eventDate || 'Not selected'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium flex items-center gap-1.5">
                    <FiClock className="text-[#D4AF37]" /> Pickup Time
                  </span>
                  <span className="font-bold text-gray-900">{form.eventTime || 'Flexible'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium flex items-center gap-1.5">
                    <FiMapPin className="text-[#C2185B]" /> Pickup City
                  </span>
                  <span className="font-bold text-gray-900 truncate max-w-[160px]">{form.city || cab?.location?.city || 'Patna'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium flex items-center gap-1.5">
                    <FiUsers className="text-emerald-500" /> Guests / Seats
                  </span>
                  <span className="font-bold text-gray-900">{form.guestCount || 4} Seats</span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="py-6 space-y-3 border-b border-gray-100 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Base Fare / Package</span>
                  <span className="font-bold text-gray-900">{baseFare ? formatPrice(subtotal) : 'Contact for Price'}</span>
                </div>
                {baseFare > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Taxes &amp; GST (5%)</span>
                    <span className="font-bold text-gray-700">{formatPrice(gst)}</span>
                  </div>
                )}
              </div>

              <div className="pt-6 flex justify-between items-baseline mb-6">
                <span className="font-black text-sm text-gray-900">Total Payable Amount</span>
                <span className="font-serif font-black text-2xl sm:text-3xl text-[#0B1021]">
                  {baseFare > 0 ? formatPrice(totalAmount) : 'Contact Vendor'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-amber-900 text-[11px] font-medium flex items-center gap-2">
                <FiInfo className="text-[#D4AF37] shrink-0" />
                <span>No advance payment required now. Pay directly after vendor confirmation.</span>
              </div>
            </div>
          </div>

          {/* =========================================================
              RIGHT / BOTTOM: BOOKING DETAILS FORM
              ========================================================= */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="bg-white rounded-[2.5rem] p-7 sm:p-10 shadow-sm border border-gray-100">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#D4AF37] block mb-2">
                RESERVE YOUR CELEBRATION RIDE
              </span>
              <h1 className="font-serif font-black text-3xl text-gray-900 mb-8">
                Booking Details
              </h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section 1: Schedule & Route */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
                    1. Ceremony Schedule &amp; Route
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">
                        Wedding Date *
                      </label>
                      <input
                        type="date"
                        name="eventDate"
                        value={form.eventDate}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">
                        Pickup Time *
                      </label>
                      <input
                        type="time"
                        name="eventTime"
                        value={form.eventTime}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">
                        Pickup Location / Address *
                      </label>
                      <input
                        type="text"
                        name="pickupLocation"
                        placeholder="Groom's residence / Hotel address"
                        value={form.pickupLocation}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">
                        Destination Venue *
                      </label>
                      <input
                        type="text"
                        name="dropLocation"
                        placeholder="Wedding hall / Banquet address"
                        value={form.dropLocation}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Contact Information */}
                <div className="pt-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
                    2. Contact Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">
                        Contact Person Name *
                      </label>
                      <input
                        type="text"
                        name="contactName"
                        placeholder="Your full name"
                        value={form.contactName}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">
                        WhatsApp / Mobile Number *
                      </label>
                      <input
                        type="tel"
                        name="contactPhone"
                        placeholder="10-digit mobile number"
                        value={form.contactPhone}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Special Requests */}
                <div className="pt-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
                    3. Special Requests &amp; Floral Decoration
                  </h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Message for Vendor (Optional)
                    </label>
                    <textarea
                      name="message"
                      rows={3}
                      placeholder="e.g. Requesting red & golden floral decor, ribbon styling, or specific arrival timing instructions..."
                      value={form.message}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Submit CTA */}
                <div className="pt-6 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#B38D22] text-[#0B1021] py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_10px_25px_rgba(212,175,55,0.35)] hover:shadow-[0_15px_30px_rgba(212,175,55,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[52px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting Reservation...' : 'Confirm Booking 👑'}
                  </button>

                  <p className="text-center text-xs text-gray-500 font-medium mt-3">
                    By confirming, you agree to ShaadiSaathi&apos;s verified Baraat transportation terms &amp; conditions.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
