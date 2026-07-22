import React from 'react';

/**
 * Full-page skeleton for BaraatCabsPage.
 * Used as the Suspense fallback so users NEVER see the global LoadingScreen.
 * Matches the exact layout of the real page: Hero → Search → Fleet cards.
 */
export default function BaraatCabsSkeleton() {
  return (
    <div className="min-h-screen bg-[#FDFCF8] font-sans">
      {/* ── HERO SKELETON ── */}
      <div className="relative bg-gray-900 pt-32 pb-40 overflow-hidden">
        <div className="absolute inset-0 bg-gray-800 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDFCF8] via-gray-900/60 to-gray-900/80" />
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/10 border border-white/20 mb-8 mx-auto">
            <div className="w-4 h-4 rounded-full bg-amber-400/50 animate-pulse" />
            <div className="w-40 h-3 bg-white/20 rounded animate-pulse" />
          </div>
          <div className="w-3/4 h-14 md:h-20 bg-white/10 rounded-2xl mx-auto mb-6 animate-pulse" />
          <div className="w-1/2 h-6 bg-white/10 rounded-xl mx-auto animate-pulse" />
        </div>
      </div>

      {/* ── FLOATING SEARCH PANEL SKELETON ── */}
      <div className="max-w-6xl mx-auto px-4 relative z-20 -mt-24 mb-16">
        <div className="bg-white/90 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/40 shadow-[0_30px_60px_rgba(0,0,0,0.12)] flex flex-col md:flex-row gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-1 bg-gray-50 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="w-20 h-2 bg-gray-200 rounded animate-pulse" />
                <div className="w-32 h-4 bg-gray-300 rounded animate-pulse" />
              </div>
            </div>
          ))}
          <div className="md:w-auto w-full flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-800 animate-pulse" />
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT SKELETON ── */}
      <div className="max-w-7xl mx-auto px-4 pb-24">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Vehicle Cards Skeleton */}
          <div className="flex-1 space-y-8">
            {/* Section Header */}
            <div className="flex justify-between items-end mb-4">
              <div className="space-y-3">
                <div className="w-28 h-2 bg-amber-200 rounded animate-pulse" />
                <div className="w-44 h-9 bg-gray-200 rounded-lg animate-pulse" />
              </div>
              <div className="w-36 h-14 bg-gray-100 rounded-[1.5rem] animate-pulse" />
            </div>

            {/* Vehicle Cards */}
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col md:flex-row animate-pulse">
                {/* Image Section */}
                <div className="w-full md:w-2/5 min-h-[260px] bg-gray-200 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" style={{ backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <div className="w-24 h-7 bg-black/10 rounded-xl" />
                    <div className="w-20 h-7 bg-amber-100 rounded-xl" />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 bg-white/40 p-3 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300 shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="w-16 h-2 bg-gray-300 rounded" />
                      <div className="w-28 h-3 bg-gray-400 rounded" />
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-8 w-full md:w-3/5 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-3 flex-1">
                      <div className="w-48 h-8 bg-gray-200 rounded-lg" />
                      <div className="flex gap-4">
                        <div className="w-20 h-4 bg-gray-100 rounded" />
                        <div className="w-20 h-4 bg-gray-100 rounded" />
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="w-16 h-3 bg-gray-200 rounded ml-auto" />
                      <div className="w-24 h-8 bg-gray-300 rounded ml-auto" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="h-12 bg-gray-50 rounded-2xl border border-gray-100" />
                    <div className="h-12 bg-gray-50 rounded-2xl border border-gray-100" />
                  </div>

                  <div className="mt-auto pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-20 h-12 bg-gray-100 rounded-full" />
                      <div className="w-32 h-6 bg-gray-200 rounded-lg" />
                    </div>
                    <div className="w-full sm:w-40 h-14 bg-gray-800 rounded-[1.5rem]" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Fleet Builder Sidebar Skeleton */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="sticky top-28">
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_20px_60px_rgba(0,0,0,0.06)] overflow-hidden">
                <div className="h-2 bg-gray-200" />
                <div className="p-8 space-y-6">
                  <div className="w-36 h-8 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="w-full h-24 bg-gray-50 rounded-2xl animate-pulse" />
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div className="w-28 h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="w-16 h-4 bg-gray-100 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                  <div className="w-full h-14 bg-gray-800 rounded-[1.5rem] animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
