import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import { LuStar, LuMapPin, LuArrowRight } from 'react-icons/lu';
import { getCategoryFallbackImage } from '../../utils/weddingImages';

export default function VendorRecommendations({ planId }) {
  const { t } = useTranslation();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [planId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/features/recommendations?planId=${planId}`);
      if (response.data && response.data.success) {
        setVendors(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-[#C2185B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (vendors.length === 0) return (
    <div className="text-center py-12 bg-gray-50 rounded-2xl">
      <h3 className="text-xl font-bold text-gray-900 mb-2">No local vendors found yet</h3>
      <p className="text-gray-500 mb-6">We couldn't find vendors matching your specific location right now. Explore the main directory.</p>
      <Link to="/vendors" className="bg-[#C2185B] text-white px-6 py-2 rounded-xl font-bold">Explore All Vendors</Link>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {vendors.map((vendor) => (
        <div key={vendor._id} className="bg-white rounded-[1.5rem] border border-gray-100 overflow-hidden hover:shadow-xl transition-all group">
          <div className="h-48 overflow-hidden relative">
            <img
              src={vendor.profileImage?.url || getCategoryFallbackImage(vendor.category?.slug || vendor.category?.name)}
              alt={vendor.businessName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {vendor.averageRating > 0 && (
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-sm font-bold flex items-center gap-1 shadow-sm">
                <LuStar className="text-yellow-500 fill-current" />
                <span>{vendor.averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <div className="p-6">
            <div className="text-xs font-bold text-[#C2185B] uppercase tracking-wider mb-2">
              {vendor.category?.name || 'Wedding Vendor'}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{vendor.businessName}</h3>
            <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
              <LuMapPin /> {vendor.businessAddress?.city || 'India'}
            </div>
            <Link to={`/vendors/${vendor.slug}`} className="flex items-center justify-center gap-2 w-full py-3 bg-gray-50 text-gray-900 rounded-xl font-bold hover:bg-[#C2185B] hover:text-white transition-colors">
              {t('wedding_planner.book_vendor', 'Book Vendor')} <LuArrowRight />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
