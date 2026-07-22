import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function WhyChooseUsCarousel({ cards }) {
  const carouselRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Handle scroll events to update active index (dots)
  const handleScroll = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, clientWidth } = carouselRef.current;
    // Calculate which card is currently in view
    // On mobile, card is full width. On desktop, card is 1/3 width.
    const newIndex = Math.round(scrollLeft / (clientWidth > 768 ? clientWidth / 3 : clientWidth));
    setActiveIndex(Math.min(newIndex, cards.length - 1));
  };

  // Autoplay functionality
  useEffect(() => {
    if (isHovered) return;
    
    const interval = setInterval(() => {
      if (!carouselRef.current) return;
      const { scrollLeft, clientWidth, scrollWidth } = carouselRef.current;
      
      const maxScroll = scrollWidth - clientWidth;
      const cardWidth = clientWidth > 768 ? clientWidth / 3 : clientWidth;
      
      let nextScroll = scrollLeft + cardWidth;
      
      // If we've reached the end, loop back to start
      if (nextScroll >= maxScroll + 10) { // adding small buffer for rounding
        nextScroll = 0;
      }
      
      carouselRef.current.scrollTo({ left: nextScroll, behavior: 'smooth' });
    }, 4000);

    return () => clearInterval(interval);
  }, [isHovered, cards.length]);

  const scrollPrev = () => {
    if (!carouselRef.current) return;
    const cardWidth = carouselRef.current.clientWidth > 768 ? carouselRef.current.clientWidth / 3 : carouselRef.current.clientWidth;
    carouselRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' });
  };

  const scrollNext = () => {
    if (!carouselRef.current) return;
    const cardWidth = carouselRef.current.clientWidth > 768 ? carouselRef.current.clientWidth / 3 : carouselRef.current.clientWidth;
    carouselRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
  };

  const scrollToDot = (index) => {
    if (!carouselRef.current) return;
    const cardWidth = carouselRef.current.clientWidth > 768 ? carouselRef.current.clientWidth / 3 : carouselRef.current.clientWidth;
    carouselRef.current.scrollTo({ left: cardWidth * index, behavior: 'smooth' });
  };

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      {/* Navigation Arrows (Hidden on mobile) */}
      <div className="hidden md:flex absolute top-1/2 -left-6 -translate-y-1/2 z-20">
        <button 
          onClick={scrollPrev}
          className="w-12 h-12 bg-white rounded-full shadow-lg border border-pink-100 flex items-center justify-center text-[#C2185B] hover:bg-pink-50 transition-colors focus:outline-none"
        >
          <FiChevronLeft className="text-2xl" />
        </button>
      </div>
      <div className="hidden md:flex absolute top-1/2 -right-6 -translate-y-1/2 z-20">
        <button 
          onClick={scrollNext}
          className="w-12 h-12 bg-white rounded-full shadow-lg border border-pink-100 flex items-center justify-center text-[#C2185B] hover:bg-pink-50 transition-colors focus:outline-none"
        >
          <FiChevronRight className="text-2xl" />
        </button>
      </div>

      {/* Carousel Container */}
      <div 
        ref={carouselRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto gap-4 md:gap-6 pb-8 snap-x snap-mandatory hide-scrollbar scroll-smooth"
      >
        {cards.map((feature, idx) => (
          <div 
            key={idx} 
            className="w-full sm:w-[48%] lg:w-[31%] flex-shrink-0 snap-center transition-all duration-300"
          >
            <div className={`bg-white rounded-[24px] p-8 h-full border border-pink-50 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 flex flex-col items-center text-center group ${activeIndex === idx ? 'md:scale-[1.02] shadow-[0_15px_40px_rgba(194,24,91,0.08)] border-pink-200' : 'hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(194,24,91,0.08)]'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-[#C2185B] shadow-sm mb-6 border transition-transform duration-300 ${activeIndex === idx ? 'bg-gradient-to-br from-[#FFF0F5] to-pink-50 border-pink-200 scale-110' : 'bg-gradient-to-br from-[#FFF0F5] to-white border-pink-100 group-hover:scale-110'}`}>
                <div className="text-2xl">{feature.icon}</div>
              </div>
              <h3 className={`font-bold text-lg mb-3 transition-colors ${activeIndex === idx ? 'text-[#C2185B]' : 'text-gray-900 group-hover:text-[#C2185B]'}`}>
                {feature.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center items-center gap-2 mt-2 mb-8">
        {cards.map((_, idx) => {
          // Calculate max dots for desktop to avoid empty scrolling
          // On mobile, max dots = cards.length
          // On desktop (3 items), max scrolls = cards.length - 2
          const maxDots = window.innerWidth > 1024 ? cards.length - 2 : (window.innerWidth > 768 ? cards.length - 1 : cards.length);
          
          if (idx >= maxDots && maxDots > 0) return null;

          return (
            <button
              key={idx}
              onClick={() => scrollToDot(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${activeIndex === idx ? 'w-8 bg-[#C2185B]' : 'w-2 bg-pink-200 hover:bg-pink-300'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          );
        })}
      </div>
      
      {/* Start Planning CTA under carousel */}
      <div className="text-center mt-12 mb-8">
        <Link 
          to="/services" 
          className="inline-block bg-[#C2185B] hover:bg-[#9c1349] text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-md transition-colors"
        >
          Start Planning →
        </Link>
      </div>

    </div>
  );
}
