export function SkeletonCard() {
  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="relative h-48 sm:h-56 md:h-60 overflow-hidden bg-gray-100 shimmer flex-shrink-0" />
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between bg-white">
        <div className="space-y-3">
          <div className="h-5 shimmer rounded-lg w-3/4" />
          <div className="h-4 shimmer rounded-lg w-1/2" />
          <div className="h-4 shimmer rounded-lg w-2/3" />
        </div>
        <div className="mt-5 sm:mt-6 pt-4 border-t border-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="h-8 shimmer rounded-lg w-24" />
          <div className="h-11 sm:h-10 shimmer rounded-xl w-full sm:w-28" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonLine({ w = 'full' }) {
  return <div className={`h-4 shimmer rounded-lg w-${w}`} />
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-4 shimmer rounded-lg ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  )
}
