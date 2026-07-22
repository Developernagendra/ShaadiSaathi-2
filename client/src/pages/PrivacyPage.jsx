export default function PrivacyPage() {
  const sections = [
    { title: 'Information We Collect', content: 'We collect information you provide during registration (name, email, phone), booking details, and usage data to improve our services.' },
    { title: 'How We Use Your Information', content: 'Your information is used to facilitate bookings, send notifications, improve our platform, and comply with legal obligations.' },
    { title: 'Data Security', content: 'We use industry-standard encryption and security measures to protect your personal data. No payment transactions are processed or stored on our servers, ensuring your direct offline transactions remain entirely secure.' },
    { title: 'Sharing Your Information', content: 'We share necessary booking details with vendors you book. We never sell your personal information to third parties.' },
    { title: 'Your Rights', content: 'You have the right to access, correct, or delete your personal data. Contact us at privacy@shaadisaathi.com to exercise these rights.' },
    { title: 'Cookies', content: 'We use cookies to improve your browsing experience. You can disable cookies in your browser settings, though some features may not work properly.' },
  ]
  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
          <h1 className="font-display text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-400 text-sm mb-8">Last updated: January 2025</p>
          <p className="text-gray-600 mb-8">At ShaadiSaathi, we are committed to protecting your privacy and handling your data with care and transparency.</p>
          <div className="space-y-8">
            {sections.map(({ title, content }) => (
              <div key={title}>
                <h2 className="font-display text-xl font-semibold text-gray-800 mb-3">{title}</h2>
                <p className="text-gray-600 leading-relaxed">{content}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 pt-6 border-t border-gray-100">
            <p className="text-gray-400 text-sm">For privacy concerns, contact: <a href="mailto:privacy@shaadisaathi.com" className="text-primary-600 hover:underline">privacy@shaadisaathi.com</a></p>
          </div>
        </div>
      </div>
    </div>
  )
}
