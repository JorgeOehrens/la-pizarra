import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LaPizarra · Deck — 100.000 ligas amateur en el mundo.',
  description:
    'LaPizarra: la plataforma para fútbol amateur. 265M jugadores, 300K+ equipos formales, mercado amateur de US$10B y creciendo 8% al año. Cómo llegamos a 100.000 ligas con SEO, Instagram y go-to-market regional.',
  robots: { index: false, follow: false },
}

export default function DeckLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
