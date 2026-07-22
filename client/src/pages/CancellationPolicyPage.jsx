import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function CancellationPolicyPage() {
  useEffect(() => {
    document.title = "Cancellation Policy - ShaadiSaathi";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 md:p-12"
      >
        <h1 className="font-display text-3xl md:text-5xl font-black text-gray-900 mb-8">Cancellation Policy</h1>
        
        <div className="prose prose-pink max-w-none text-gray-600 space-y-6">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Booking Cancellations</h2>
          <p>
            Users may request a cancellation of a booked service directly through their ShaadiSaathi dashboard. The eligibility and terms of the cancellation are governed by the specific vendor's policy agreed upon at the time of booking.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Vendor Cancellation Terms</h2>
          <p>
            Every vendor on ShaadiSaathi maintains their own cancellation timeline (e.g., full refund if cancelled 30 days prior, 50% refund if cancelled 15 days prior, etc.). Please ensure you read these terms before making a milestone payment.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Baraat Cabs Cancellations</h2>
          <p>
            For our premium Baraat Cabs service:
            <ul className="list-disc pl-5 mt-2">
              <li>Cancellations made 7+ days before the event: 100% refund of the booking amount.</li>
              <li>Cancellations made 3-7 days before the event: 50% refund.</li>
              <li>Cancellations made within 48 hours of the event: No refund.</li>
            </ul>
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Force Majeure</h2>
          <p>
            In the event of natural disasters, government restrictions, or extreme unforeseen circumstances, ShaadiSaathi will work with vendors to negotiate flexible rescheduling options or fair cancellations.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Contact</h2>
          <p>
            For urgent cancellation queries, please contact <a href="mailto:support@shaadisaathi.com" className="text-[#C2185B] hover:underline">support@shaadisaathi.com</a>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
