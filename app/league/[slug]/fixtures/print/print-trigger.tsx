'use client'

import { useEffect } from 'react'

/**
 * Auto-fires the browser print dialog after the page mounts.
 * The user picks "Save as PDF" from the print sheet.
 *
 * Also renders a small fallback toolbar (hidden in print) so the
 * user can re-trigger printing or close the tab.
 */
export function PrintTrigger({ leagueName }: { leagueName: string }) {
  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        document.title = `Fixture - ${leagueName}`
      } catch {}
      window.print()
    }, 400)
    return () => window.clearTimeout(t)
  }, [leagueName])

  return (
    <div
      className="no-print"
      style={{
        position: 'sticky',
        top: 0,
        background: '#fff',
        borderBottom: '1px solid #eee',
        padding: '8px 12px',
        marginBottom: 12,
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        justifyContent: 'flex-end',
        fontSize: 12,
        color: '#555',
        zIndex: 10,
      }}
    >
      <span>¿No se abrió el diálogo de impresión?</span>
      <button
        onClick={() => window.print()}
        style={{
          background: '#111',
          color: '#fff',
          border: 'none',
          padding: '6px 12px',
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}
      >
        Imprimir / PDF
      </button>
      <button
        onClick={() => window.close()}
        style={{
          background: 'transparent',
          color: '#555',
          border: '1px solid #ccc',
          padding: '6px 12px',
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}
      >
        Cerrar
      </button>
    </div>
  )
}
