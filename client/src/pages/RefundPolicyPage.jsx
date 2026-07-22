import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function RefundPolicyPage() {
  useEffect(() => {
    document.title = "Refund Policy - ShaadiSaathi";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 md:p-12"
      >
        <h1 className="font-display text-3xl md:text-5xl font-black text-gray-900 mb-8">Refund Policy</h1>
        
        <div className="prose prose-pink max-w-none text-gray-600 space-y-6">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. General Refund Guidelines</h2>
          <p>
            At ShaadiSaathi, we strive to ensure a smooth and transparent experience for all our users. Refunds are processed based on the specific service or vendor booked through our platform.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Vendor Booking Refunds</h2>
          <p>
            Refund policies for individual vendors (photographers, decorators, venues, etc.) are determined by the vendor's own policy. Please review the specific vendor's terms before making a payment. ShaadiSaathi acts as a facilitator and will assist in mediating disputes, but the final refund decision lies with the vendor.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. ShaadiSaathi Platform Fees</h2>
          <p>
            Any convenience fees or platform fees charged directly by ShaadiSaathi are non-refundable unless the service was not rendered due to a technical failure on our end.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Processing Time</h2>
          <p>
            Approved refunds will be processed within 5-7 business days and credited back to the original method of payment.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Contact Us</h2>
          <p>
            If you have any questions about our Refund Policy, please contact our support team at <a href="mailto:support@shaadisaathi.com" className="text-[#C2185B] hover:underline">support@shaadisaathi.com</a>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
