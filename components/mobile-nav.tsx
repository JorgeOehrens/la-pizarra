"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Users, Trophy, User, Wallet, Dumbbell } from "lucide-react"
import { features } from "@/lib/features"

const BASE_NAV = [
  { href: "/home",    label: "Inicio",   icon: Home    },
  { href: "/team",    label: "Equipo",   icon: Users   },
  { href: "/matches", label: "Partidos", icon: Trophy  },
  { href: "/finance", label: "Finanzas", icon: Wallet  },
  { href: "/profile", label: "Perfil",   icon: User    },
]

const TRAINING_ITEM = { href: "/training", label: "Entrena", icon: Dumbbell }

const navItems = features.training
  ? [
      BASE_NAV[0],
      BASE_NAV[1],
      BASE_NAV[2],
      TRAINING_ITEM,
      BASE_NAV[3],
      BASE_NAV[4],
    ]
  : BASE_NAV

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-2 py-2 min-w-0 flex-1 transition-colors",
                isActive
                  ? "text-accent"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span
                className={cn(
                  "text-[10px] uppercase tracking-wider truncate",
                  isActive && "font-medium"
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
