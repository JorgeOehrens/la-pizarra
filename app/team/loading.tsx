import { AppShell } from "@/components/app-shell"

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-muted animate-pulse rounded-lg ${className}`} />
}

export default function TeamLoading() {
  return (
    <AppShell>
      <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
            <div className="space-y-2">
              <Skeleton className="w-16 h-3 rounded" />
              <Skeleton className="w-36 h-7 rounded" />
            </div>
          </div>
          <Skeleton className="w-9 h-9 rounded-lg" />
        </div>

        {/* Tabs */}
        <Skeleton className="h-11 rounded-xl mb-6" />

        {/* Performance card */}
        <Skeleton className="h-52 rounded-xl mb-5" />

        {/* Top players */}
        <Skeleton className="w-44 h-6 rounded mb-4" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    </AppShell>
  )
}
