'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Home as HomeIcon, ListOrdered, Swords, Trophy, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

type TabKey = 'home' | 'fixtures' | 'bracket' | 'standings' | 'teams' | 'seasons'

const TABS: Array<{ key: TabKey; label: string; icon: typeof HomeIcon; suffix: string }> = [
  { key: 'home',      label: 'Inicio',    icon: HomeIcon,    suffix: '' },
  { key: 'fixtures',  label: 'Fixtures',  icon: Calendar,    suffix: '/fixtures' },
  { key: 'bracket',   label: 'Llave',     icon: Swords,      suffix: '/bracket' },
  { key: 'standings', label: 'Tabla',     icon: ListOrdered, suffix: '/standings' },
  { key: 'teams',     label: 'Equipos',   icon: Users,       suffix: '/teams' },
  { key: 'seasons',   label: 'Temporadas',icon: Trophy,      suffix: '/seasons' },
]

function pickActive(pathname: string, leagueSlug: string): TabKey {
  const base = `/league/${leagueSlug}`
  if (pathname === base) return 'home'
  if (pathname.startsWith(`${base}/fixtures`)) return 'fixtures'
  if (pathname.startsWith(`${base}/bracket`)) return 'bracket'
  if (pathname.startsWith(`${base}/standings`)) return 'standings'
  if (pathname.startsWith(`${base}/teams`)) return 'teams'
  if (pathname.startsWith(`${base}/seasons`)) return 'seasons'
  return 'home'
}

export function LeagueTabs({ slug }: { slug: string }) {
  const pathname = usePathname() ?? ''
  const active = pickActive(pathname, slug)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-sm border-t border-border safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {TABS.map((tab) => {
          const isActive = tab.key === active
          const Icon = tab.icon
          const href = `/league/${slug}${tab.suffix}`
          return (
            <Link
              key={tab.key}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-2 py-2 min-w-0 flex-1 transition-colors',
                isActive ? 'text-accent' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span
                className={cn(
                  'text-[10px] uppercase tracking-wider truncate',
                  isActive && 'font-medium',
                )}
              >
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
