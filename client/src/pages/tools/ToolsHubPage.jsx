import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  LuSparkles, LuWallet, LuUsers, LuMapPin, LuPackage,
  LuMail, LuScale, LuCar, LuTrendingUp, LuCalendar,
  LuSearch, LuArrowRight
} from 'react-icons/lu';
import { FiCheckSquare, FiStar, FiCalendar, FiHeart, FiClock, FiMap, FiCheckCircle } from 'react-icons/fi';
import api from '../../utils/api';

const categories = ['All', 'Planning', 'Budget', 'Guests', 'Invitation', 'Design', 'Wedding', 'Other'];

export default function ToolsHubPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Try different ways the auth state might be stored
  const authState = useSelector((state) => state.auth || state.user || {});
  const isLoggedIn = !!authState.isAuthenticated || !!authState.token || !!authState.user;

  useEffect(() => {
    // Log entry to tools hub
    api.post('/tools/track', { toolName: 'Tools Hub', action: 'viewed_hub' }).catch(() => { });
  }, []);

  // Main featured tools
  const tools = [
    {
      id: 'wedding-planner',
      title: t('tools_hub.tool_planner_title', 'Wedding Planner'),
      description: t('tools_hub.tool_planner_desc', 'Plan your complete wedding journey from start to finish.'),
      category: 'Planning',
      icon: <FiHeart />,
      path: '/tools/wedding-planner',
      color: 'from-[#C2185B] to-[#8E244D]',
      bg: 'bg-pink-50',
      text: 'text-[#C2185B]',
      featured: true
    },
    {
      id: 'timeline',
      title: t('tools_hub.tool_timeline_title', 'Wedding Timeline'),
      description: t('tools_hub.tool_timeline_desc', 'Plan every event and ritual on time.'),
      category: 'Planning',
      icon: <FiCalendar />,
      path: '/tools/wedding-timeline',
      color: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      featured: true
    },
    {
      id: 'venue-planner',
      title: t('tools_hub.tool_venue_title', 'Venue Planning'),
      description: t('tools_hub.tool_venue_desc', 'Discover and organize your wedding venue requirements.'),
      category: 'Wedding',
      icon: <LuMapPin />,
      path: '/tools/venue-planning',
      color: 'from-rose-500 to-pink-500',
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      featured: true
    },
    {
      id: 'shubh-muhurat',
      title: t('tools_hub.tool_muhurat_title', 'Shubh Muhurat'),
      description: t('tools_hub.tool_muhurat_desc', 'Find auspicious wedding dates and timings.'),
      category: 'Planning',
      icon: <FiStar />,
      path: '/tools/shubh-muhurat',
      color: 'from-yellow-500 to-amber-600',
      bg: 'bg-yellow-50',
      text: 'text-[#D4AF37]',
      featured: true
    },
    {
      id: 'kundli-matching',
      title: t('tools_hub.tool_kundli_title', 'Kundli Matching'),
      description: t('tools_hub.tool_kundli_desc', 'Traditional Vedic Ashtakoot Guna Milan compatibility.'),
      category: 'Planning',
      icon: <FiHeart />,
      path: '/tools/kundli-matching',
      color: 'from-purple-500 to-indigo-600',
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      featured: true
    },
    {
      id: 'budget-planner',
      title: t('tools_hub.tool_budget_title', 'Wedding Budget Planner'),
      description: t('tools_hub.tool_budget_desc', 'Plan and manage your complete wedding budget.'),
      category: 'Budget',
      icon: <LuWallet />,
      path: '/tools/wedding-budget',
      color: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      featured: true
    },
    {
      id: 'checklist',
      title: t('tools_hub.tool_checklist_title', 'Wedding Checklist'),
      description: t('tools_hub.tool_checklist_desc', 'Never miss an important wedding task.'),
      category: 'Planning',
      icon: <FiCheckSquare />,
      path: '/tools/wedding-checklist',
      color: 'from-blue-500 to-cyan-600',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      featured: true
    },
    {
      id: 'wedding-packages',
      title: t('tools_hub.tool_packages_title', 'Wedding Packages'),
      description: t('tools_hub.tool_packages_desc', 'Explore curated all-inclusive wedding packages.'),
      category: 'Wedding',
      icon: <LuSparkles />,
      path: '/wedding-packages',
      color: 'from-[#D4AF37] to-yellow-600',
      bg: 'bg-yellow-50',
      text: 'text-[#D4AF37]',
      featured: true
    },
    {
      id: 'baraat-ride',
      title: t('tools_hub.tool_baraat_title', 'Baraat Ride'),
      description: t('tools_hub.tool_baraat_desc', 'Book luxury cars, vintage cars, and ghodi for your Baraat.'),
      category: 'Other',
      icon: <LuCar />,
      path: '/baraat-cabs',
      color: 'from-red-500 to-rose-600',
      bg: 'bg-red-50',
      text: 'text-red-600',
      featured: true
    },
    {
      id: 'expert-consultation',
      title: t('tools_hub.tool_expert_title', 'Talk to an Expert'),
      description: t('tools_hub.tool_expert_desc', 'Get complimentary 1-on-1 guidance from ShaadiSaathi planners.'),
      category: 'Planning',
      icon: <LuUsers />,
      path: '/tools/expert-consultation',
      color: 'from-indigo-600 to-blue-700',
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      featured: true
    },
    {
      id: 'guest-manager',
      title: t('tools_hub.tool_guest_title', 'Guest List Manager'),
      description: t('tools_hub.tool_guest_desc', 'Manage guests, invitations and RSVP.'),
      category: 'Guests',
      icon: <LuUsers />,
      path: '/tools/guest-manager',
      color: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      featured: true
    },
    {
      id: 'vendor-finder',
      title: t('tools_hub.tool_vendor_title', 'Vendor Finder'),
      description: t('tools_hub.tool_vendor_desc', 'Find trusted wedding vendors near you.'),
      category: 'Wedding',
      icon: <LuSearch />,
      path: '/vendors',
      color: 'from-purple-500 to-indigo-500',
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      featured: true
    },
    {
      id: 'vendor-availability',
      title: 'Vendor Availability Checker',
      description: 'Check real-time availability of top wedding vendors for your auspicious dates.',
      category: 'Wedding',
      icon: <FiCheckCircle />,
      path: '/tools/vendor-availability',
      color: 'from-amber-500 to-yellow-600',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      featured: true
    },
    {
      id: 'vendor-compare',
      title: 'Vendor Comparison Tool',
      description: 'Compare prices, ratings, and features of up to 3 vendors side-by-side.',
      category: 'Wedding',
      icon: <LuScale />,
      path: '/tools/vendor-compare',
      color: 'from-indigo-500 to-blue-600',
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      featured: true
    },
    {
      id: 'package-builder',
      title: 'Custom Package Builder',
      description: 'Customize and assemble your dream wedding vendor bundle.',
      category: 'Design',
      icon: <LuSparkles />,
      path: '/tools/package-builder',
      color: 'from-pink-500 to-rose-600',
      bg: 'bg-pink-50',
      text: 'text-pink-600',
      featured: true
    },
    {
      id: 'baraat-calculator',
      title: 'Baraat Distance & Timing',
      description: 'Calculate travel distance, timing, and costs for your royal Baraat procession.',
      category: 'Other',
      icon: <LuCar />,
      path: '/tools/baraat-calculator',
      color: 'from-red-500 to-orange-600',
      bg: 'bg-red-50',
      text: 'text-red-600',
      featured: true
    },
    {
      id: 'invitation',
      title: t('tools_hub.tool_invite_title', 'Invitation Generator'),
      description: t('tools_hub.tool_invite_desc', 'Create beautiful digital wedding invitations.'),
      category: 'Invitation',
      icon: <LuMail />,
      path: '/tools/invitation-generator',
      color: 'from-[#D4AF37] to-yellow-500',
      bg: 'bg-yellow-50',
      text: 'text-[#D4AF37]',
      featured: true,
      ctaText: 'Create Now →'
    },
    // Smart Tools
    {
      id: 'ai-planner',
      title: t('tools_hub.tool_ai_title', 'AI Wedding Planner'),
      description: t('tools_hub.tool_ai_desc', 'Get personalized wedding planning suggestions.'),
      category: 'Planning',
      icon: <LuSparkles />,
      path: '/tools/ai-planner',
      color: 'from-purple-600 to-indigo-600',
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      smart: true
    },
    {
      id: 'cost-predictor',
      title: t('tools_hub.tool_calc_budget_title', 'Budget Calculator'),
      description: t('tools_hub.tool_calc_budget_desc', 'Calculate your estimated wedding expenses.'),
      category: 'Budget',
      icon: <LuTrendingUp />,
      path: '/tools/cost-predictor',
      color: 'from-emerald-600 to-teal-600',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      smart: true
    }
  ];

  const biharTools = [
    { icon: '🪷', title: t('tools_hub.bihar_mithila', 'Mithila Wedding Planner'), path: '/tools/mithila-planner' },
    { icon: '🐎', title: t('tools_hub.bihar_baraat', 'Baraat Planner'), path: '/tools/baraat-calculator' },
    { icon: '🥁', title: t('tools_hub.bihar_dj', 'DJ & Band Planner'), path: '/vendors?category=dj' },
    { icon: '🍛', title: t('tools_hub.bihar_catering', 'Bihari Catering Planner'), path: '/vendors?category=catering' },
    { icon: '🏛️', title: t('tools_hub.bihar_vivah', 'Vivah Bhawan Finder'), path: '/vendors?category=venues' },
    { icon: '🙏', title: t('tools_hub.bihar_purohit', 'Purohit / Pandit Finder'), path: '/vendors?category=pandit' },
    { icon: '🎨', title: t('tools_hub.bihar_madhubani', 'Madhubani Wedding Inspiration'), path: '/blog' },
    { icon: '💐', title: t('tools_hub.bihar_decoration', 'Traditional Decoration Ideas'), path: '/vendors?category=event-planners' }
  ];

  const journeySteps = [
    { num: '01', title: t('tools_hub.journey_1', 'Plan') },
    { num: '02', title: t('tools_hub.journey_2', 'Budget') },
    { num: '03', title: t('tools_hub.journey_3', 'Find Vendors') },
    { num: '04', title: t('tools_hub.journey_4', 'Book Services') },
    { num: '05', title: t('tools_hub.journey_5', 'Manage Guests') },
    { num: '06', title: t('tools_hub.journey_6', 'Celebrate 🎉') }
  ];

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || tool.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans pb-20 overflow-hidden">

      {/* 1. HERO SECTION */}
      <div className="relative bg-[#FFF8F0] pt-32 pb-20 md:pb-32 overflow-hidden border-b border-[#D4AF37]/20">
        <div className="absolute inset-0 floral-pattern opacity-5 pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#C2185B]/10 rounded-full blur-3xl" />
        <div className="absolute top-20 -left-20 w-72 h-72 bg-[#D4AF37]/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center justify-center px-4 py-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full text-xs font-bold tracking-widest mb-6 border border-[#D4AF37]/20 uppercase">
                {t('tools_hub.hero_title', 'Wedding Tools Hub 💍')}
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-gray-900 mb-6 tracking-tight leading-tight">
                {t('tools_hub.hero_desc', 'Plan Your Perfect Wedding')}
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-gray-600 text-lg md:text-xl font-medium mb-10 max-w-2xl leading-relaxed">
                {t('tools_hub.hero_subdesc', 'ShaadiSaathi ke smart wedding tools ke saath apni shaadi ki planning ko simple, beautiful aur stress-free banayein.')}
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                <a href="#tools-grid" className="w-full sm:w-auto px-8 py-4 bg-[#C2185B] text-white rounded-full font-bold text-lg hover:bg-[#a3154d] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 text-center">
                  {t('tools_hub.hero_btn_explore', 'Explore Wedding Tools')}
                </a>
                <Link to="/tools/ai-planner" className="w-full sm:w-auto px-8 py-4 bg-white text-[#C2185B] rounded-full font-bold text-lg hover:bg-pink-50 transition-all shadow-md border border-pink-100 text-center">
                  {t('tools_hub.hero_btn_start', 'Start Planning')}
                </Link>
              </motion.div>
            </div>

            <div className="flex-1 w-full max-w-lg md:max-w-none relative">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.8 }} className="relative z-10 w-full h-[400px] md:h-[500px] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
                <img src="https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2?auto=format&fit=crop&w=800&q=80" alt="Indian Wedding" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/95 backdrop-blur rounded-2xl p-4 shadow-xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-[#C2185B] text-xl">
                      <FiCheckSquare />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">{t('tools_hub.plan_progress', 'Wedding Planning Progress')}</p>
                      <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
                        <div className="bg-[#C2185B] h-2 rounded-full w-[65%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              {/* Decorative Elements */}
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute -top-6 -right-6 w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center text-4xl border border-gray-100 z-20">
                💍
              </motion.div>
              <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute -bottom-6 -left-6 w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center text-4xl border border-gray-100 z-20">
                🌸
              </motion.div>
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 4.5 }} className="absolute top-1/2 -left-8 w-16 h-16 bg-white rounded-2xl shadow-xl items-center justify-center text-3xl border border-gray-100 z-20 hidden sm:flex">
                ✨
              </motion.div>
              <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 5.5 }} className="absolute -top-4 left-1/4 w-16 h-16 bg-white rounded-2xl shadow-xl items-center justify-center text-3xl border border-gray-100 z-20 hidden sm:flex">
                💌
              </motion.div>
              <motion.div animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 6 }} className="absolute bottom-12 -right-8 w-16 h-16 bg-white rounded-2xl shadow-xl items-center justify-center text-3xl border border-gray-100 z-20 hidden sm:flex">
                🎉
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. QUICK TOOL SEARCH */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white rounded-[2rem] p-4 md:p-6 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:w-1/3">
            <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder={t('tools_hub.search_placeholder', '🔍 Search wedding tools...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C2185B]/20 focus:border-[#C2185B] transition-all text-gray-700 font-medium"
            />
          </div>
          <div className="w-full md:w-2/3 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <div className="flex items-center gap-2 min-w-max">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeCategory === cat
                      ? 'bg-[#C2185B] text-white shadow-md'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                >
                  {t(`tools_hub.filter_${cat.toLowerCase()}`, cat)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. FEATURED TOOLS */}
      <div id="tools-grid" className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-display font-black text-gray-900 mb-10 text-center">{activeCategory === 'All' ? 'All Wedding Tools' : `${activeCategory} Tools`}</h2>

        {filteredTools.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No tools found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredTools.map((tool, idx) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  key={tool.id}
                >
                  <Link to={tool.path} className="bg-white rounded-[1.5rem] p-6 shadow-sm hover:shadow-xl border border-gray-100 hover:border-pink-200 transition-all duration-300 group flex flex-col h-full hover:-translate-y-1 relative overflow-hidden">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-sm ${tool.bg || 'bg-pink-50'} ${tool.text || 'text-[#C2185B]'} group-hover:scale-110 group-hover:bg-[#C2185B] group-hover:text-white transition-all duration-300 relative z-10`}>
                      {tool.icon}
                    </div>

                    <h3 className="font-display text-xl font-black text-gray-900 mb-2 group-hover:text-[#C2185B] transition-colors">{tool.title}</h3>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed flex-grow">{tool.description}</p>

                    <div className="mt-6 flex items-center gap-2 text-[#C2185B] font-bold text-sm">
                      {tool.ctaText || t('tools_hub.open_tool', 'Open Tool →')}
                      <LuArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* 4. SMART WEDDING TOOLS */}
      <div className="bg-white py-20 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-black text-gray-900 mb-4">{t('tools_hub.smart_tools_title', 'Smart Wedding Planning Tools 🧠')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tools.filter(t => t.smart).map((tool) => (
              <Link to={tool.path} key={tool.id} className="bg-[#FAFAFA] rounded-[2rem] p-8 border border-gray-100 hover:border-[#C2185B]/30 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden flex flex-col">
                <div className={`absolute top-0 right-0 w-40 h-40 rounded-bl-full opacity-5 bg-gradient-to-br ${tool.color} pointer-events-none group-hover:scale-110 transition-transform duration-500`} />
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mb-6 shadow-inner ${tool.bg} ${tool.text} group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                  {tool.icon}
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-[#C2185B] transition-colors">{tool.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed flex-grow">{tool.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 5. BIHAR WEDDING TOOLS */}
      <div className="max-w-7xl mx-auto px-4 py-20 relative">
        <div className="absolute inset-0 floral-pattern opacity-[0.02] pointer-events-none rounded-[3rem]" />
        <div className="bg-[#FFF8F0] rounded-[3rem] p-8 md:p-12 border border-[#D4AF37]/20 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#FFF8F0] to-[#FFEDD5] opacity-50 pointer-events-none" />

          <div className="text-center mb-12 relative z-10">
            <h2 className="text-3xl md:text-4xl font-display font-black text-[#8E244D] mb-4">{t('tools_hub.bihar_tools_title', 'Plan Your Bihari Wedding ❤️')}</h2>
            <p className="text-[#C2185B] font-medium text-lg">{t('tools_hub.bihar_tools_subtitle', 'Traditional Bihar wedding planning, made simple.')}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 relative z-10">
            {biharTools.map((tool, idx) => (
              <Link to={tool.path} key={idx} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white hover:shadow-xl transition-all hover:-translate-y-1 border border-white/50 group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{tool.icon}</div>
                <h3 className="font-bold text-gray-800 text-sm md:text-base leading-tight group-hover:text-[#8E244D] transition-colors">{tool.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 6. WEDDING PLANNING JOURNEY */}
      <div className="bg-gray-900 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl font-display font-black text-white mb-16 text-center">{t('tools_hub.journey_title', 'Wedding Planning Journey')}</h2>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-1/2 left-10 right-10 h-0.5 bg-gray-700 -translate-y-1/2 z-0" />

            {journeySteps.map((step, idx) => (
              <div key={idx} className="flex flex-row md:flex-col items-center gap-4 relative z-10 w-full md:w-auto">
                <div className="w-12 h-12 rounded-full bg-gray-800 border-2 border-[#D4AF37] text-[#D4AF37] flex items-center justify-center font-black text-lg shadow-lg">
                  {step.num}
                </div>
                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 text-white font-bold text-center flex-1 md:flex-none">
                  {step.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 8. MY WEDDING PLAN (AUTH) */}
      <div className="max-w-5xl mx-auto px-4 py-20">
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl border border-gray-100 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            {isLoggedIn ? (
              <>
                <h2 className="text-3xl font-display font-black text-gray-900 mb-4">{t('tools_hub.plan_title_auth', 'Your Wedding Plan ❤️')}</h2>
                <div className="mb-6">
                  <div className="flex justify-between text-sm font-bold text-gray-600 mb-2">
                    <span>{t('tools_hub.plan_progress', 'Wedding Planning Progress')}</span>
                    <span className="text-[#C2185B]">65%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: '65%' }} viewport={{ once: true }} transition={{ duration: 1, ease: 'easeOut' }} className="bg-gradient-to-r from-[#C2185B] to-[#8E244D] h-full rounded-full" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-green-50 text-green-700 p-3 rounded-xl font-bold text-sm text-center">✓ 8 Vendors Booked</div>
                  <div className="bg-blue-50 text-blue-700 p-3 rounded-xl font-bold text-sm text-center">✓ 120 Guests Added</div>
                  <div className="bg-orange-50 text-orange-700 p-3 rounded-xl font-bold text-sm text-center">⏳ 5 {t('tools_hub.plan_tasks_rem', 'Tasks Remaining')}</div>
                  <div className="bg-purple-50 text-purple-700 p-3 rounded-xl font-bold text-sm text-center">📅 90 {t('tools_hub.plan_days_left', 'Days Left')}</div>
                </div>
                <Link to="/user/dashboard" className="inline-flex items-center justify-center w-full md:w-auto px-8 py-3.5 bg-[#C2185B] text-white rounded-xl font-bold text-lg hover:bg-[#a3154d] transition-all shadow-md">
                  {t('tools_hub.plan_cta_continue', 'Continue Planning →')}
                </Link>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-display font-black text-gray-900 mb-4">{t('tools_hub.plan_title_guest', 'Create Your Wedding Plan')}</h2>
                <p className="text-gray-500 font-medium text-lg mb-8 leading-relaxed max-w-md">
                  {t('tools_hub.plan_desc_guest', 'Login karke apni complete wedding planning ek jagah manage karein.')}
                </p>
                <Link to="/tools/ai-planner" className="inline-flex items-center justify-center w-full md:w-auto px-8 py-3.5 bg-[#C2185B] text-white rounded-xl font-bold text-lg hover:bg-[#a3154d] transition-all shadow-md">
                  {t('tools_hub.plan_cta_start', 'Start Planning →')}
                </Link>
              </>
            )}
          </div>
          <div className="flex-1 w-full flex justify-center">
            <div className="w-64 h-64 bg-pink-50 rounded-full flex items-center justify-center border-[12px] border-white shadow-xl relative">
              <FiHeart className="text-[#C2185B] text-6xl animate-pulse" />
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg text-2xl border border-gray-100">✨</div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg text-2xl border border-gray-100">📸</div>
            </div>
          </div>
        </div>
      </div>

      {/* 9. CALL TO ACTION */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="bg-gradient-to-r from-[#8E244D] to-[#C2185B] rounded-[3rem] p-10 md:p-16 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 floral-pattern opacity-10 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-display font-black text-white mb-6">{t('tools_hub.cta_title', 'Your Dream Wedding Starts Here ❤️')}</h2>
            <p className="text-pink-100 text-xl font-medium mb-10 max-w-2xl mx-auto">{t('tools_hub.cta_subtitle', 'Plan. Book. Celebrate.')}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/tools/ai-planner" className="w-full sm:w-auto px-8 py-4 bg-white text-[#C2185B] rounded-full font-bold text-lg hover:bg-gray-50 transition-all shadow-lg hover:-translate-y-1">
                {t('tools_hub.cta_btn_start', 'Start Planning')}
              </Link>
              <Link to="/vendors" className="w-full sm:w-auto px-8 py-4 bg-[#D4AF37] text-white rounded-full font-bold text-lg hover:bg-[#b5952f] transition-all shadow-lg hover:-translate-y-1">
                {t('tools_hub.cta_btn_explore', 'Explore Vendors')}
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
