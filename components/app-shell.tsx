"use client"

import { MobileNav } from "./mobile-nav"

interface AppShellProps {
  children: React.ReactNode
  showNav?: boolean
}

export function AppShell({ children, showNav = true }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className={showNav ? "pb-20" : ""}>
        {children}
      </main>
      {showNav && <MobileNav />}
    </div>
  )
}
