import { useState } from 'react'
import { FiChevronDown } from 'react-icons/fi';
const faqs = [
  { q: 'How do I book a vendor on ShaadiSaathi?', a: 'Browse vendors, view their profiles, select a package, and click "Book Now". Fill in your event details and confirm the booking. You\'ll receive a confirmation email.' },
  { q: 'Are all vendors on ShaadiSaathi verified?', a: 'Yes! Every vendor goes through a manual verification process by our team before being listed. We check business credentials and reviews.' },
  { q: 'What is the Baraat Cab Bundle feature?', a: 'Our unique bulk cab booking lets you select multiple vehicle types (Sedans, SUVs, Tempo Travellers, Luxury Buses) for your baraat procession in one booking with bundle pricing.' },
  { q: 'Are there any booking or platform fees?', a: 'No! ShaadiSaathi is entirely free for customers to browse, inquire, and book vendors. All bookings are finalized directly with the vendor offline, and no payment is processed on our platform.' },
  { q: 'Can I cancel a booking?', a: 'Yes, you can cancel bookings from your dashboard. Cancellation policies vary by vendor. Check the vendor\'s policy before booking.' },
  { q: 'How do I register as a vendor?', a: 'Click "List Your Business" and complete the 3-step registration: create account, add business info, and set your packages. Our team reviews applications within 24-48 hours.' },
  { q: 'Can I chat with vendors before booking?', a: 'Yes! Use our built-in chat feature to message vendors directly, ask questions, and get quotes before committing to a booking.' },
  { q: 'What cities are covered?', a: 'We cover 200+ cities across India including all major metros (Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Kolkata) and Tier-2 cities.' },
]
export default function FAQPage() {
  const [open, setOpen] = useState(null)
  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-gray-900 mb-3">Frequently Asked Questions ❓</h1>
          <p className="text-gray-500">Everything you need to know about ShaadiSaathi</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
                <span className="font-semibold text-gray-800 pr-4">{faq.q}</span>
                <FiChevronDown className={`flex-shrink-0 text-primary-600 transition-transform ${open === i ? 'rotate-180' : ''}`} size={20} />
              </button>
              {open === i && (
                <div className="px-5 pb-5">
                  <p className="text-gray-600 leading-relaxed text-sm">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
