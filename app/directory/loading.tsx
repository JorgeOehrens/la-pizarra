import { AppShell } from "@/components/app-shell"

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-white/[0.06] animate-pulse rounded-lg ${className}`} />
}

export default function DirectoryLoading() {
  return (
    <AppShell>
      <div className="min-h-full bg-black px-4 pt-6 pb-24 max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6 space-y-1.5">
          <Skeleton className="w-32 h-3 rounded-full" />
          <Skeleton className="w-56 h-9 rounded" />
          <Skeleton className="w-48 h-9 rounded" />
        </div>

        {/* Search */}
        <Skeleton className="w-full h-12 rounded-full mb-5" />

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[152px] rounded-2xl" />
          ))}
        </div>
      </div>
    </AppShell>
  )
}
