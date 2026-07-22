export default function Badge({ children, variant = 'primary', size = 'sm' }) {
  const variants = {
    primary: 'bg-primary-100 text-primary-700',
    gold: 'bg-gold-100 text-gold-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    gray: 'bg-gray-100 text-gray-600',
    yellow: 'bg-yellow-100 text-yellow-700',
    purple: 'bg-purple-100 text-purple-700',
  }
  const sizes = { sm: 'text-xs px-2.5 py-0.5', md: 'text-sm px-3 py-1' }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  )
}
