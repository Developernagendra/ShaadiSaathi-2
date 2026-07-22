import { FiRefreshCcw, FiShield, FiCreditCard } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function BookingHelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="font-display font-black text-4xl md:text-5xl text-gray-900 tracking-tight">
            Booking & <span className="text-[#C2185B] italic">Cancellations</span>
          </h1>
          <p className="text-gray-500 font-medium text-lg">Understanding our secure booking process and policies.</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex gap-6">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl shrink-0">
              <FiShield />
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-xl mb-2">Secure Booking Process</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                When you book a vendor or a Baraat Cab through ShaadiSaathi, your payment is held securely in escrow. 
                The vendor is only paid once the service is successfully delivered. This ensures you always get exactly what you paid for.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex gap-6">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl shrink-0">
              <FiCreditCard />
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-xl mb-2">Payment Methods</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                We accept all major Credit/Debit Cards, Net Banking, and popular UPI apps including Google Pay, PhonePe, and Paytm.
                EMI options are available for bookings above ₹50,000 via partnered banks.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex gap-6">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center text-2xl shrink-0">
              <FiRefreshCcw />
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-xl mb-2">Cancellation & Refund Policy</h3>
              <p className="text-gray-600 leading-relaxed text-sm mb-4">
                Cancellations are subject to the individual vendor's policy, but standard ShaadiSaathi guidelines apply:
              </p>
              <ul className="list-disc list-inside text-gray-500 text-sm space-y-2 ml-2">
                <li><strong>30+ Days Before:</strong> 100% Refund (minus minimal platform fee).</li>
                <li><strong>15-30 Days Before:</strong> 50% Refund of the booking advance.</li>
                <li><strong>Less than 15 Days:</strong> Non-refundable.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link to="/contact" className="text-[#C2185B] font-black uppercase tracking-widest text-[10px] hover:underline">
            Have a specific question? Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
