import { AppShell } from "@/components/app-shell"

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-muted animate-pulse rounded-lg ${className}`} />
}

export default function MatchDetailLoading() {
  return (
    <AppShell showNav={false}>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-4 max-w-lg mx-auto">
          <Skeleton className="w-9 h-9 rounded-lg" />
          <Skeleton className="w-24 h-5 rounded" />
          <Skeleton className="w-9 h-9 rounded-lg" />
        </div>
      </div>

      <div className="px-4 pb-8 max-w-lg mx-auto">
        {/* Score card */}
        <Skeleton className="h-40 rounded-2xl mb-4" />

        {/* Attendance */}
        <Skeleton className="h-28 rounded-2xl mb-4" />

        {/* Timeline */}
        <div className="mb-4">
          <Skeleton className="w-32 h-5 rounded mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                <Skeleton className="flex-1 h-10 rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        {/* Players */}
        <Skeleton className="h-40 rounded-xl" />
      </div>
    </AppShell>
  )
}
