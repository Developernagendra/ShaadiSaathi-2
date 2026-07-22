export default function TermsPage() {
  const sections = [
    { title: '1. Acceptance of Terms', content: 'By using ShaadiSaathi, you agree to these Terms and Conditions. If you do not agree, please discontinue use of our platform.' },
    { title: '2. User Accounts', content: 'You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information during registration.' },
    { title: '3. Vendor Listings', content: 'Vendors are responsible for the accuracy of their listings. ShaadiSaathi verifies vendors but does not guarantee service quality.' },
    { title: '4. Bookings & Services', content: 'Bookings are agreements made directly between users and vendors. ShaadiSaathi facilitates bookings and lead generations but is not a party to these agreements. No payments are processed online through our platform; all financial settlements are handled directly between the customer and the service provider.' },
    { title: '5. Cancellation Policy', content: 'Cancellation policies are set by individual vendors. ShaadiSaathi is not responsible for cancellation fees charged by vendors.' },
    { title: '6. Prohibited Activities', content: 'Users may not post false information, harass other users, attempt to circumvent our platform, or engage in fraudulent activities.' },
    { title: '7. Limitation of Liability', content: 'ShaadiSaathi is not liable for any indirect, incidental, or consequential damages arising from use of our platform.' },
    { title: '8. Changes to Terms', content: 'We may update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.' },
  ]
  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
          <h1 className="font-display text-4xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
          <p className="text-gray-400 text-sm mb-8">Last updated: January 2025</p>
          <p className="text-gray-600 mb-8">Please read these Terms and Conditions carefully before using ShaadiSaathi.</p>
          <div className="space-y-8">
            {sections.map(({ title, content }) => (
              <div key={title}>
                <h2 className="font-display text-xl font-semibold text-gray-800 mb-3">{title}</h2>
                <p className="text-gray-600 leading-relaxed">{content}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 pt-6 border-t border-gray-100">
            <p className="text-gray-400 text-sm">For questions: <a href="mailto:legal@shaadisaathi.com" className="text-primary-600 hover:underline">legal@shaadisaathi.com</a></p>
          </div>
        </div>
      </div>
    </div>
  )
}
