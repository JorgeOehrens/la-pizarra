import { AppShell } from "@/components/app-shell"

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-muted animate-pulse rounded-lg ${className}`} />
}

export default function FinanceLoading() {
  return (
    <AppShell>
      <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <Skeleton className="w-20 h-3 rounded" />
            <Skeleton className="w-40 h-7 rounded" />
          </div>
          <Skeleton className="w-9 h-9 rounded-lg" />
        </div>
        <Skeleton className="h-24 rounded-xl mb-4" />
        <Skeleton className="w-32 h-5 rounded mb-3" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl mb-3" />
        ))}
      </div>
    </AppShell>
  )
}
