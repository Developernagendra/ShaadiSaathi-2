import { motion } from 'framer-motion';
import { FiCheck, FiStar, FiZap, FiCalendar } from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { fetchMyVendorProfile } from '../store/slices/vendorSlice';
import { formatPrice } from '../utils/helpers';

const plans = [
  {
    name: 'Free',
    price: 0,
    icon: <FiStar className="text-gray-400" />,
    features: [
      'Basic listing on platform',
      'Standard search ranking priority',
      'Standard leads access',
      'Maximum 5 gallery uploads limit',
      'Standard customer support'
    ],
    color: 'gray',
    description: 'Perfect for new businesses starting their wedding marketplace journey.'
  },
  {
    name: 'Premium',
    price: 4999,
    icon: <FiZap className="text-pink-600 animate-pulse" />,
    features: [
      'Premium Featured Vendor Badge',
      'Homepage Featured Listings exposure',
      'Top search ranking priority',
      'Priority leads notification & access',
      'Unlimited gallery image uploads',
      'Advanced profile analytics dashboard'
    ],
    color: 'pink',
    popular: true,
    description: 'Grow your business faster with boosted search visibility and priority leads.'
  },
  {
    name: 'Elite',
    price: 9999,
    icon: <FaCrown className="text-[#D4AF37]" />,
    features: [
      'All Premium Tier features included',
      'Highest search ranking placement',
      'Elite AI Business Insights reports',
      'Premium dedicated account support',
      'Featured badge & priority onboarding verification'
    ],
    color: 'gold',
    description: 'Maximum exposure, elite rankings, and data-driven insights to dominate the market.'
  }
];

const VendorSubscriptionPage = () => {
  const dispatch = useDispatch();
  const { myVendorProfile: vendor } = useSelector(s => s.vendor || {});
  
  const handleUpgrade = async (plan) => {
    try {
      const { data } = await api.post('/vendors/activate-subscription', {
        planName: plan.name
      });
      toast.success(`Welcome to the ${plan.name} Plan! 🎉`);
      dispatch(fetchMyVendorProfile());
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to activate subscription plan');
    }
  };

  const getActiveSubscriptionPlan = () => {
    if (vendor?.subscription?.status === 'active') {
      return vendor.subscription.plan?.toLowerCase() || 'free';
    }
    return 'free'; // default
  };

  const currentPlan = getActiveSubscriptionPlan();

  return (
    <div className="pb-24 animate-fade-in relative max-w-7xl mx-auto px-4 md:px-8 pt-8">
      <div className="absolute inset-0 floral-pattern opacity-[0.02] pointer-events-none" />

      {/* ── ⭐ CURRENT PLAN CARD (Glassmorphic Luxury Card) ── */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0B1530] via-[#1E3A8A] to-slate-900 border border-white/10 shadow-[0_30px_80px_rgba(30,58,138,0.25)] p-8 md:p-12 mb-16 text-white">
        <div className="absolute inset-0 floral-pattern opacity-[0.03]" />
        <div className="absolute top-0 right-0 w-72 md:w-[400px] h-[400px] bg-gradient-to-bl from-[#D4AF37]/10 to-transparent rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 md:w-[300px] h-[300px] bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-stretch justify-between gap-8 md:gap-12">
          {/* Left Side: Current Plan Details */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-4 py-1.5 rounded-full mb-6">
                <span className="text-[#D4AF37]">⭐</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Active Subscription</span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
                Your ShaadiSaathi <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] shine-effect">Partner Tier</span>
              </h2>
              <p className="text-white/60 max-w-xl text-sm md:text-base font-medium italic mb-8">
                Empower your business profile. Upgrade to Premium or Elite to unlock top directory rankings, instant customer leads, and unlimited portfolios.
              </p>
            </div>

            {/* Benefits Used Progress Segment */}
            <div className="space-y-4 max-w-lg bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6">
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-white/80">
                <span className="flex items-center gap-2">📈 Profile Benefits Used</span>
                <span>{currentPlan === 'free' ? `${vendor?.images?.length || 0}/5 Gallery Slots` : 'Unlimited Gallery'}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden border border-white/5">
                <div 
                  className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] h-full rounded-full transition-all duration-[1s]" 
                  style={{ width: currentPlan === 'free' ? `${Math.min(((vendor?.images?.length || 0) / 5) * 100, 100)}%` : '100%' }}
                />
              </div>
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-white/60">
                <span className="flex items-center gap-1.5">✓ Search Visibility: {currentPlan === 'elite' ? 'Highest' : currentPlan === 'premium' ? 'High' : 'Basic'}</span>
                <span className="flex items-center gap-1.5">✓ Leads: {currentPlan === 'free' ? 'Standard' : 'Priority'}</span>
                {currentPlan === 'elite' && <span className="flex items-center gap-1.5">✓ AI Business Insights Active</span>}
              </div>
            </div>
          </div>

          {/* Right Side: Glassmorphic Plan Badge & Actions */}
          <div className="lg:w-96 flex flex-col justify-between bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />

            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">CURRENT PLAN</span>
                <h3 className="font-display font-black text-3xl uppercase tracking-wider text-white mt-1 flex items-center gap-2">
                  {currentPlan === 'elite' ? '👑 Elite' : currentPlan === 'premium' ? '⚡ Premium' : '⭐ Free'}
                </h3>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                Active
              </span>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-sm text-white/80">
                <FiCalendar className="text-[#D4AF37] shrink-0" size={16} />
                <span>
                  {currentPlan === 'free' 
                    ? 'Expiration: Lifetime access' 
                    : `Expires: ${vendor?.subscription?.endDate ? new Date(vendor.subscription.endDate).toLocaleDateString() : 'N/A'}`
                  }
                </span>
              </div>
              {currentPlan !== 'free' && vendor?.subscription?.endDate && (
                <div className="text-xs text-white/50 italic bg-white/5 p-3.5 rounded-xl border border-white/5">
                  Remaining Days: {Math.max(0, Math.ceil((new Date(vendor.subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)))} Days
                </div>
              )}
            </div>

            {/* Quick CTA inside current plan */}
            {currentPlan !== 'elite' ? (
              <button 
                onClick={() => {
                  const targetPlan = currentPlan === 'free' ? plans[1] : plans[2];
                  handleUpgrade(targetPlan);
                }}
                className="w-full bg-gradient-to-r from-[#D4AF37] via-[#F4D03F] to-[#D4AF37] text-black font-black text-[10px] uppercase tracking-widest py-4 rounded-xl shadow-[0_5px_20px_rgba(212,175,55,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-[#D4AF37]/50 hover:shadow-[0_8px_30px_rgba(212,175,55,0.5)] shine-effect"
              >
                <FaCrown size={12} /> Upgrade Tier Now
              </button>
            ) : (
              <button 
                onClick={() => handleUpgrade(plans[2])}
                className="w-full bg-white/10 hover:bg-white/15 text-white font-black text-[10px] uppercase tracking-widest py-4 rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2"
              >
                <FiZap size={12} className="text-[#D4AF37]" /> Renew Elite Plan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 🪙 SUBSCRIPTION PLANS GRID (Equal Height & Micro-animations) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10 items-stretch mb-20 relative z-10">
        {plans.map((plan, idx) => {
          const isCurrent = currentPlan === plan.name.toLowerCase();
          const isUpgrade = !isCurrent && (
            (currentPlan === 'free' && (plan.name === 'Premium' || plan.name === 'Elite')) ||
            (currentPlan === 'premium' && plan.name === 'Elite')
          );
          const isRenew = isCurrent && plan.name !== 'Free';

          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className={`bg-white rounded-[3rem] p-8 md:p-10 border flex flex-col justify-between h-full transform transition-all duration-500 hover:-translate-y-2 hover:scale-[1.03] relative ${
                plan.name === 'Premium' 
                  ? 'border-[#C2185B]/50 shadow-[0_25px_60px_rgba(194,24,91,0.08)] ring-2 ring-[#C2185B]/10 z-10' 
                  : plan.name === 'Elite'
                  ? 'border-[#D4AF37]/50 shadow-[0_25px_60px_rgba(212,175,55,0.08)] ring-2 ring-[#D4AF37]/10'
                  : 'border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)]'
              }`}
            >
              {plan.name === 'Premium' && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#C2185B] via-[#D4AF37] to-[#C2185B] bg-[length:200%_auto] text-white px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg border border-pink-500/30 animate-shimmer flex items-center gap-1.5">
                  ✨ Most Popular
                </div>
              )}
              {plan.name === 'Elite' && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#D4AF37] via-[#FFF8F0] to-[#D4AF37] text-black px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg border border-[#D4AF37]/40 shine-effect flex items-center gap-1.5">
                  👑 Best Value
                </div>
              )}

              <div>
                <div className="mb-8 flex items-center justify-between border-b border-gray-50 pb-6">
                  <div>
                    <h3 className="font-display font-black text-3xl text-gray-900 mb-1 flex items-center gap-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest">{plan.name === 'Free' ? 'Starter' : 'Growth Plan'}</p>
                  </div>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${
                    plan.name === 'Elite' ? 'bg-[#FFF9E6] text-[#D4AF37]' : plan.name === 'Premium' ? 'bg-pink-50 text-[#C2185B]' : 'bg-gray-50 text-gray-400'
                  }`}>
                    <span className="text-2xl">{plan.icon}</span>
                  </div>
                </div>

                <p className="text-gray-500 text-sm leading-relaxed min-h-[50px] italic font-medium">
                  {plan.description}
                </p>

                <div className="my-8 flex items-baseline">
                  <span className="font-display text-5xl font-black text-gray-900">
                    {plan.price === 0 ? '₹0' : formatPrice(plan.price)}
                  </span>
                  <span className="text-gray-400 text-xs font-black uppercase tracking-widest ml-2">
                    {plan.price === 0 ? 'Forever' : '/ Year'}
                  </span>
                </div>

                <ul className="space-y-4 mb-10 pt-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-gray-600 font-semibold leading-relaxed">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                        plan.name === 'Elite' ? 'bg-[#FFF9E6] border-[#D4AF37]/30' : plan.name === 'Premium' ? 'bg-pink-50 border-pink-100' : 'bg-gray-50 border-gray-100'
                      }`}>
                        <FiCheck size={12} className={plan.name === 'Elite' ? 'text-[#D4AF37]' : plan.name === 'Premium' ? 'text-[#C2185B]' : 'text-gray-400'} />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto pt-6 border-t border-gray-50">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full bg-gray-50 text-gray-400 border border-gray-200 py-4.5 rounded-2xl font-black text-[10px] uppercase tracking-widest italic cursor-default flex items-center justify-center gap-2"
                  >
                    Current Active Tier
                  </button>
                ) : isRenew ? (
                  <button
                    onClick={() => handleUpgrade(plan)}
                    className="w-full bg-gradient-to-r from-[#C2185B] to-[#8E244D] text-white py-4.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-pink-200/50 hover:bg-right transition-all duration-500 shine-effect flex items-center justify-center gap-2"
                  >
                    Renew Subscription Plan
                  </button>
                ) : isUpgrade ? (
                  <button
                    onClick={() => handleUpgrade(plan)}
                    className={`w-full py-4.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      plan.name === 'Elite'
                        ? 'bg-gradient-to-r from-[#D4AF37] via-[#F4D03F] to-[#D4AF37] text-black shadow-lg shadow-yellow-100 hover:shadow-xl shine-effect'
                        : plan.name === 'Premium'
                        ? 'bg-gradient-to-r from-[#C2185B] to-[#8E244D] text-white shadow-lg shadow-pink-100 hover:shadow-xl shine-effect'
                        : 'bg-gray-900 text-white hover:bg-black shadow-lg hover:shadow-xl'
                    }`}
                  >
                    Upgrade to {plan.name}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-50 text-gray-400 border border-gray-100 py-4.5 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-not-allowed"
                  >
                    Downgrade Locked
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── 📊 FEATURE COMPARISON TABLE (Responsive Matrix) ── */}
      <div className="mt-24 bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50/10 rounded-bl-full pointer-events-none" />
        <div className="absolute inset-0 floral-pattern opacity-[0.01]" />

        <div className="text-center md:text-left mb-10">
          <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">COMPLETE BREAKDOWN</span>
          <h2 className="font-display text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Feature Comparison</h2>
          <p className="text-gray-500 font-medium italic mt-2">Compare limits and ranking visibility side-by-side to choose the best option.</p>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-6 text-sm font-black text-gray-400 uppercase tracking-widest w-[40%]">Platform Feature</th>
                <th className="pb-6 text-sm font-black text-gray-900 uppercase tracking-widest text-center w-[20%]">Free</th>
                <th className="pb-6 text-sm font-black text-[#C2185B] uppercase tracking-widest text-center w-[20%]">Premium</th>
                <th className="pb-6 text-sm font-black text-[#D4AF37] uppercase tracking-widest text-center w-[20%]">Elite</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { name: 'Featured Vendor Badge', free: false, premium: true, elite: true, detail: 'Luxury Badge with verification shine' },
                { name: 'Priority Leads Access', free: false, premium: true, elite: true, detail: 'Instant lead alerts & contact access' },
                { name: 'Homepage Placement', free: false, premium: true, elite: true, detail: 'Showcase in Featured Category section' },
                { name: 'Search Ranking Boost', free: 'Basic Visibility', premium: 'Top Priority', elite: 'Highest Placement', detail: 'Primary sort priority on directory page' },
                { name: 'Profile Analytics', free: 'Basic Counters', premium: 'Advanced Dashboard', elite: 'Advanced Dashboard', detail: 'Views, leads clicks, and search stats' },
                { name: 'Premium Support', free: false, premium: false, elite: true, detail: 'Dedicated account manager response' },
                { name: 'AI Business Insights', free: false, premium: false, elite: true, detail: 'Personalized marketplace analytics reports' },
              ].map((row) => (
                <tr key={row.name} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-6">
                    <p className="font-bold text-gray-900 text-base">{row.name}</p>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">{row.detail}</p>
                  </td>
                  <td className="py-6 text-center">
                    {typeof row.free === 'boolean' ? (
                      row.free ? <FiCheck className="text-green-600 mx-auto" size={20} /> : <span className="text-gray-300">—</span>
                    ) : (
                      <span className="text-xs font-bold text-gray-500">{row.free}</span>
                    )}
                  </td>
                  <td className="py-6 text-center bg-pink-50/20">
                    {typeof row.premium === 'boolean' ? (
                      row.premium ? <FiCheck className="text-[#C2185B] mx-auto" size={20} /> : <span className="text-gray-300">—</span>
                    ) : (
                      <span className="text-xs font-black text-[#C2185B]">{row.premium}</span>
                    )}
                  </td>
                  <td className="py-6 text-center bg-yellow-50/20">
                    {typeof row.elite === 'boolean' ? (
                      row.elite ? <FiCheck className="text-[#D4AF37] mx-auto" size={20} /> : <span className="text-gray-300">—</span>
                    ) : (
                      <span className="text-xs font-black text-[#D4AF37]">{row.elite}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Accordion/List Cards View */}
        <div className="block md:hidden space-y-6">
          {[
            {
              tier: 'Free Plan',
              color: 'text-gray-500 border-gray-200 bg-gray-50/50',
              features: [
                { name: 'Featured Badge', value: false },
                { name: 'Priority Leads', value: false },
                { name: 'Homepage Placement', value: false },
                { name: 'Search Ranking Boost', value: 'Basic Visibility' },
                { name: 'Profile Analytics', value: 'Basic Counters' },
                { name: 'Premium Support', value: false },
                { name: 'AI Business Insights', value: false },
              ]
            },
            {
              tier: 'Premium Plan',
              color: 'text-[#C2185B] border-pink-100 bg-pink-50/20',
              features: [
                { name: 'Featured Badge', value: true },
                { name: 'Priority Leads', value: true },
                { name: 'Homepage Placement', value: true },
                { name: 'Search Ranking Boost', value: 'Top Priority' },
                { name: 'Profile Analytics', value: 'Advanced Dashboard' },
                { name: 'Premium Support', value: false },
                { name: 'AI Business Insights', value: false },
              ]
            },
            {
              tier: 'Elite Plan',
              color: 'text-[#D4AF37] border-yellow-100 bg-yellow-50/20',
              features: [
                { name: 'Featured Badge', value: true },
                { name: 'Priority Leads', value: true },
                { name: 'Homepage Placement', value: true },
                { name: 'Search Ranking Boost', value: 'Highest Placement' },
                { name: 'Profile Analytics', value: 'Advanced Dashboard' },
                { name: 'Premium Support', value: true },
                { name: 'AI Business Insights', value: true },
              ]
            }
          ].map((tierCard) => (
            <div key={tierCard.tier} className={`border rounded-2xl p-6 ${tierCard.color}`}>
              <h4 className="font-display font-black text-xl mb-4">{tierCard.tier}</h4>
              <ul className="space-y-3.5">
                {tierCard.features.map((f) => (
                  <li key={f.name} className="flex justify-between items-center text-xs text-gray-700">
                    <span className="font-semibold text-gray-500">{f.name}</span>
                    <span className="font-black text-gray-900">
                      {typeof f.value === 'boolean' ? (
                        f.value ? <FiCheck className="inline text-green-600" size={16} /> : <span className="text-gray-300">—</span>
                      ) : (
                        <span>{f.value}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Support / Contact sales footer block */}
      <div className="mt-16 bg-[#FFF8F0] rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-pink-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100/30 rounded-bl-full" />
        <div className="max-w-xl text-center md:text-left relative z-10">
          <h2 className="font-display text-2xl md:text-3xl font-black text-[#C2185B] mb-3">Looking for a Enterprise setup?</h2>
          <p className="text-gray-600 font-medium italic">
            Are you a large hotel chain or fleet coordinator with high volume listings? We offer customized packages tailored directly to your scale.
          </p>
        </div>
        <button className="whitespace-nowrap bg-white text-[#C2185B] px-8 py-4.5 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-pink-200 hover:bg-pink-50 shadow-md transition-all active:scale-95 z-10">
          Talk to Support Team
        </button>
      </div>
    </div>
  );
};

export default VendorSubscriptionPage;
