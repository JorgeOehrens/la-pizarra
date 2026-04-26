import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

type Cross = { href: string; label: string; description?: string }

export function CrossLinkRow({ items }: { items: Cross[] }) {
  return (
    <div className="border-t border-border/30 pt-10 mt-12">
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4">
        ¿Otra mirada?
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group flex items-center gap-3 bg-card border border-border/30 rounded-xl p-4 hover:border-accent/30 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">{c.label}</p>
              {c.description && (
                <p className="text-xs text-white/50 mt-0.5">{c.description}</p>
              )}
            </div>
            <ArrowRight className="h-4 w-4 text-accent group-hover:translate-x-0.5 transition-transform shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )
}
