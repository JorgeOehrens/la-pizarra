import { AppShell } from "@/components/app-shell"

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-muted animate-pulse rounded-lg ${className}`} />
}

export default function ProfileLoading() {
  return (
    <AppShell>
      <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
        {/* Header */}
        <Skeleton className="w-24 h-8 rounded mb-8" />

        {/* User card */}
        <div className="bg-card rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="w-36 h-5 rounded" />
              <Skeleton className="w-24 h-3 rounded" />
              <Skeleton className="w-28 h-3 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 pt-5 border-t border-border/40">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12 rounded" />
            ))}
          </div>
        </div>

        {/* Role badge */}
        <Skeleton className="h-16 rounded-xl mb-6" />

        {/* Menu */}
        <Skeleton className="h-14 rounded-xl mb-1" />
        <Skeleton className="h-14 rounded-xl" />
      </div>
    </AppShell>
  )
}
