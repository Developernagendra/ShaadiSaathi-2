import BrandLogo from './BrandLogo'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[9999]">
      <div className="relative mb-6">
        <BrandLogo asLink={false} showTagline={false} />
        <div className="absolute -inset-4 rounded-3xl border border-transparent border-t-[#C2185B] animate-spin opacity-50" />
      </div>
      <p className="text-gray-400 text-sm mt-1 font-bold tracking-widest uppercase animate-pulse">Loading your wedding world…</p>
    </div>
  )
}
