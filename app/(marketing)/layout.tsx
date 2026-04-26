import { Suspense } from 'react'
import { MarketingNav } from '@/components/marketing/marketing-nav'
import { MarketingFooter } from '@/components/marketing/marketing-footer'
import { AnalyticsPageView } from '@/components/analytics-page-view'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-[100dvh] bg-black text-foreground flex flex-col">
      {/* Suspense wraps the page-view tracker because it uses useSearchParams. */}
      <Suspense fallback={null}>
        <AnalyticsPageView />
      </Suspense>
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  )
}
