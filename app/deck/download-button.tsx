'use client'

import { Download } from 'lucide-react'

export function DownloadDeckButton() {
  return (
    <a
      href="/deck/print"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-white/70 hover:text-white border border-white/15 hover:border-white/30 px-3 py-1.5 rounded-md transition-colors"
    >
      <Download className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Descargar PDF</span>
      <span className="sm:hidden">PDF</span>
    </a>
  )
}
