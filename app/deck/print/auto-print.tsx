'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

/**
 * Auto-triggers the browser print dialog after first paint.
 * The query param `?print=1` is the default the download button passes;
 * we honor `?print=0` to disable for screen preview / debugging.
 */
export function AutoPrint() {
  const params = useSearchParams()
  const enabled = params.get('print') !== '0'

  useEffect(() => {
    if (!enabled) return
    const timer = setTimeout(() => {
      window.print()
    }, 600)
    return () => clearTimeout(timer)
  }, [enabled])

  return null
}
