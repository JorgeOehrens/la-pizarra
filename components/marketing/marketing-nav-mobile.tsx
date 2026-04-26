'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { MarketingNavLinks } from './marketing-nav-links'

export function MarketingNavMobile({ rightCta }: { rightCta: { href: string; label: string } }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden p-2 -mr-2 text-white/70 hover:text-white"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute right-0 top-0 bottom-0 w-72 bg-black border-l border-border/30 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <span className="font-display text-xl">
                LA<span className="text-accent"> PIZARRA</span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 -mr-2 text-white/70 hover:text-white"
                aria-label="Cerrar menú"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div onClick={() => setOpen(false)}>
              <MarketingNavLinks orientation="vertical" />
            </div>
            <div className="mt-auto">
              <Link
                href={rightCta.href}
                className="block w-full text-center bg-[#D7FF00] text-black py-3 rounded-xl font-display uppercase tracking-wide"
                onClick={() => setOpen(false)}
              >
                {rightCta.label}
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
