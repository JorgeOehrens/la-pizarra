import { AppShell } from "@/components/app-shell"

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-muted animate-pulse rounded-lg ${className}`} />
}

export default function MatchesLoading() {
  return (
    <AppShell>
      <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <Skeleton className="w-20 h-3 rounded" />
            <Skeleton className="w-32 h-8 rounded" />
          </div>
          <Skeleton className="w-9 h-9 rounded-lg" />
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>

        {/* Upcoming section */}
        <div className="mb-6">
          <Skeleton className="w-24 h-3 rounded mb-3" />
          <Skeleton className="h-20 rounded-lg" />
        </div>

        {/* History section */}
        <div className="mb-6">
          <Skeleton className="w-20 h-3 rounded mb-3" />
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
