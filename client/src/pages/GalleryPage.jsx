import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiZoomIn, FiLoader, FiImage } from 'react-icons/fi';
import api from '../utils/api';

export default function GalleryPage() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxImage, setLightboxImage] = useState(null);

  const categories = ['All', 'Weddings', 'Decoration', 'Mehndi', 'Photography', 'Venues', 'Baraat Cabs'];

  useEffect(() => {
    document.title = "Gallery - ShaadiSaathi";
    window.scrollTo(0, 0);
    fetchGalleryPhotos();
  }, []);

  const fetchGalleryPhotos = async () => {
    setLoading(true);
    try {
      const res = await api.get('/showcase/gallery');
      const albums = res.data.data;
      
      // Flatten albums into an array of photos
      const flatPhotos = [];
      albums.forEach(album => {
        album.images.forEach(img => {
          flatPhotos.push({
            url: img,
            caption: album.title,
            category: album.category
          });
        });
      });
      
      setPhotos(flatPhotos);
    } catch (error) {
      console.error("Failed to fetch gallery photos:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPhotos = photos.filter(photo => {
    return activeCategory === 'All' || photo.category === activeCategory;
  });

  // Prevent scrolling when lightbox is open
  useEffect(() => {
    if (lightboxImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [lightboxImage]);

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 font-sans">
      
      {/* ── HEADER ── */}
      <section className="py-12 px-4 mb-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight mb-4">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#B38D22] italic">Gallery</span>
            </h1>
            <p className="text-gray-500 text-lg md:text-xl font-medium max-w-2xl mx-auto">
              Explore the magic of weddings planned through ShaadiSaathi. From stunning decor to luxury Baraat arrivals.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        
        {/* ── CATEGORY FILTERS ── */}
        <div className="flex overflow-x-auto hide-scrollbar scroll-smooth snap-x snap-mandatory gap-2 md:gap-3 mb-8 md:mb-10 pb-4 justify-start md:justify-center px-1">
          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => setActiveCategory(cat)}
              className={`snap-center shrink-0 whitespace-nowrap px-5 py-2.5 md:px-6 md:py-3 rounded-full text-xs md:text-sm font-bold transition-all border ${
                activeCategory === cat 
                  ? 'bg-gray-900 border-gray-900 text-white shadow-md' 
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── MASONRY GRID OR EMPTY STATE ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FiLoader className="text-4xl text-[#D4AF37] animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading beautiful memories...</p>
          </div>
        ) : filteredPhotos.length > 0 ? (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {filteredPhotos.map((photo, i) => (
              <motion.div 
                key={photo._id || i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (i % 10) * 0.05 }}
                className="relative group cursor-pointer overflow-hidden rounded-2xl break-inside-avoid"
                onClick={() => setLightboxImage(photo.url)}
              >
                <img 
                  src={photo.url} 
                  alt={photo.caption || "Wedding Gallery"} 
                  className="w-full h-auto object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white">
                  <FiZoomIn className="text-4xl mb-2" />
                  {photo.caption && <span className="font-bold text-sm px-4 text-center">{photo.caption}</span>}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-24 text-center bg-gray-50 rounded-[3rem] border border-gray-100 px-4">
            <div className="w-24 h-24 bg-white shadow-sm rounded-full flex items-center justify-center mb-6">
              <FiImage className="text-4xl text-[#D4AF37]" />
            </div>
            <h2 className="font-display text-3xl font-black text-gray-900 mb-3">Gallery Coming Soon!</h2>
            <p className="text-gray-500 font-medium max-w-md mx-auto mb-8">
              We are carefully selecting the most breathtaking high-resolution images to showcase our vendors' amazing work. Check back later!
            </p>
            <button onClick={() => window.history.back()} className="bg-gradient-to-r from-[#D4AF37] to-[#B38D22] text-black font-black uppercase tracking-widest text-xs px-8 py-4 rounded-full shadow-[0_10px_20px_rgba(212,175,55,0.2)] hover:-translate-y-1 transition-transform">
              Go Back
            </button>
          </motion.div>
        )}

      </div>

      {/* ── LIGHTBOX ── */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-12"
            onClick={() => setLightboxImage(null)}
          >
            <button 
              className="absolute top-6 right-6 md:top-10 md:right-10 text-white/50 hover:text-white transition-colors p-2"
              onClick={() => setLightboxImage(null)}
            >
              <FiX className="text-4xl" />
            </button>
            <motion.img 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={lightboxImage} 
              alt="Lightbox Preview" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
