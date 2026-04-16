export default function TrainingLoading() {
  return (
    <div className="min-h-screen bg-black px-4 pt-8 pb-32">
      {/* Header skeleton */}
      <div className="h-3 w-36 bg-white/[0.06] rounded-full mb-4 animate-pulse" />
      <div className="h-14 w-52 bg-white/[0.06] rounded-xl mb-1 animate-pulse" />
      <div className="h-14 w-44 bg-white/[0.06] rounded-xl mb-8 animate-pulse" />

      {/* Stats row */}
      <div className="h-3 w-24 bg-white/[0.04] rounded-full mb-3 animate-pulse" />
      <div className="grid grid-cols-3 gap-2.5 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-white/[0.04] rounded-2xl animate-pulse" />
        ))}
      </div>

      {/* Integrations */}
      <div className="h-3 w-28 bg-white/[0.04] rounded-full mb-3 animate-pulse" />
      <div className="flex gap-3 overflow-hidden mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-shrink-0 w-44 h-48 bg-white/[0.04] rounded-2xl animate-pulse" />
        ))}
      </div>

      {/* History */}
      <div className="h-3 w-20 bg-white/[0.04] rounded-full mb-4 animate-pulse" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-white/[0.04] rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}
