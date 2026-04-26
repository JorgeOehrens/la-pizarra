'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const LINKS: Array<{ href: string; label: string; matchPrefix?: string }> = [
  { href: '/para-ligas', label: 'Ligas' },
  { href: '/para-equipos', label: 'Equipos' },
  { href: '/para-jugadores', label: 'Jugadores' },
  { href: '/precios', label: 'Precios' },
  { href: '/blog', label: 'Blog', matchPrefix: '/blog' },
]

export function MarketingNavLinks({ orientation = 'horizontal' }: { orientation?: 'horizontal' | 'vertical' }) {
  const pathname = usePathname() ?? ''

  function isActive(item: (typeof LINKS)[number]) {
    if (item.matchPrefix) return pathname.startsWith(item.matchPrefix)
    return pathname === item.href
  }

  return (
    <nav
      className={cn(
        orientation === 'horizontal'
          ? 'flex items-center gap-5'
          : 'flex flex-col gap-4',
      )}
    >
      {LINKS.map((item) => {
        const active = isActive(item)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'text-xs uppercase tracking-[0.18em] transition-colors',
              orientation === 'vertical' && 'text-base tracking-wider',
              active
                ? 'text-accent font-medium'
                : 'text-white/60 hover:text-white',
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
