import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AutoPrint } from './auto-print'

export const metadata: Metadata = {
  title: 'LaPizarra · Deck PDF',
  description: 'Versión PDF del deck — A4 landscape, 1 slide por página.',
  robots: { index: false, follow: false },
}

export default function DeckPrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <AutoPrint />
      </Suspense>
      {children}
    </>
  )
}
