import { AppShell } from "@/components/app-shell"

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-muted animate-pulse rounded-lg ${className}`} />
}

export default function HomeLoading() {
  return (
    <AppShell>
      <div className="px-4 pt-6 pb-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
            <div className="space-y-2">
              <Skeleton className="w-20 h-3 rounded" />
              <Skeleton className="w-40 h-6 rounded" />
            </div>
          </div>
          <Skeleton className="w-8 h-8 rounded-lg" />
        </div>

        {/* Win Rate Card */}
        <Skeleton className="h-32 rounded-2xl mb-4" />

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>

        {/* Next Match */}
        <div className="mb-5">
          <Skeleton className="w-40 h-6 rounded mb-3" />
          <Skeleton className="h-24 rounded-xl" />
        </div>

        {/* Recent Results */}
        <div className="mb-5">
          <div className="flex justify-between mb-3">
            <Skeleton className="w-44 h-6 rounded" />
            <Skeleton className="w-16 h-4 rounded" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-[88px] rounded-xl" />
            <Skeleton className="h-[88px] rounded-xl" />
            <Skeleton className="h-[88px] rounded-xl" />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
