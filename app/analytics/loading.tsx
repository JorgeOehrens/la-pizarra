import { AppShell } from "@/components/app-shell"

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-muted animate-pulse rounded-lg ${className}`} />
}

export default function AnalyticsLoading() {
  return (
    <AppShell>
      <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6 space-y-2">
          <Skeleton className="w-20 h-3 rounded" />
          <Skeleton className="w-40 h-8 rounded" />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>

        {/* Chart */}
        <Skeleton className="h-48 rounded-xl mb-5" />

        {/* Top scorers */}
        <Skeleton className="w-44 h-6 rounded mb-4" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      </div>
    </AppShell>
  )
}
