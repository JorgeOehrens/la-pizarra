/**
 * Transactional email — minimal Resend wrapper.
 *
 * Resend SDK is intentionally NOT a runtime dependency: we keep the API
 * surface tiny and POST directly with `fetch`. This keeps the bundle
 * lean and lets us swap providers later (SES, Postmark) without
 * touching callers.
 *
 * If `RESEND_API_KEY` is not set, every send is a silent no-op so the
 * waitlist flow keeps working in local/preview environments without
 * crashing. Failures during real production sends log to the console
 * but never throw — the user already got the success state UI.
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

type SendArgs = {
  to: string
  subject: string
  html: string
  /** Defaults to "LaPizarra <hola@lapizarra.app>". */
  from?: string
  replyTo?: string
}

export async function sendEmail({
  to,
  subject,
  html,
  from = process.env.RESEND_FROM_EMAIL || 'LaPizarra <hola@lapizarra.app>',
  replyTo,
}: SendArgs): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.info('[email] RESEND_API_KEY not set — skipping send', { to, subject })
    }
    return { ok: true } // intentionally non-fatal in dev
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '<no-body>')
      // eslint-disable-next-line no-console
      console.warn('[email] Resend non-200', res.status, text)
      return { ok: false, error: `resend_${res.status}` }
    }
    return { ok: true }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[email] send failed', err)
    return { ok: false, error: 'send_failed' }
  }
}

// ─────────────────────────────────────────────────────────────
// Templates (plain HTML — no MJML / Handlebars).
// Keep style inline so it survives Gmail/Outlook normalization.
// ─────────────────────────────────────────────────────────────

const PRIMARY = '#D7FF00'
const BG = '#000000'
const TEXT = '#ffffff'
const MUTED = '#9ca3af'

const AUDIENCE_LABEL: Record<string, string> = {
  ligas: 'Pro Liga',
  equipos: 'Equipos',
  jugadores: 'Jugadores',
  general: 'LaPizarra',
}

const AUDIENCE_NEXT_STEP: Record<string, string> = {
  ligas: 'Te escribimos en cuanto se libere el acceso para crear tu liga.',
  equipos: 'Mientras tanto, ya podés crear tu equipo gratis.',
  jugadores: 'Pedile a tu capitán el código del equipo y empezá a sumar partidos.',
  general: 'Te avisamos cuando haya novedades.',
}

export function waitlistConfirmationHtml(args: {
  audience: 'ligas' | 'equipos' | 'jugadores' | 'general'
  unsubscribeUrl: string
  appUrl: string
}): { subject: string; html: string } {
  const label = AUDIENCE_LABEL[args.audience]
  const nextStep = AUDIENCE_NEXT_STEP[args.audience]

  const subject = `Anotado en LaPizarra · ${label}`

  const html = `<!doctype html>
<html lang="es">
<body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:${TEXT};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#111;border:1px solid #1f1f1f;border-radius:16px;">
          <tr>
            <td style="padding:32px 24px;">
              <p style="margin:0 0 16px;color:${MUTED};text-transform:uppercase;letter-spacing:0.2em;font-size:11px;">
                Fútbol amateur · 2026
              </p>
              <h1 style="margin:0 0 8px;color:${TEXT};font-size:32px;font-weight:700;line-height:1.05;letter-spacing:-0.5px;">
                LA<span style="color:${PRIMARY};"> PIZARRA</span>
              </h1>
              <div style="height:2px;width:48px;background:${PRIMARY};margin:24px 0;"></div>
              <h2 style="margin:0 0 12px;color:${TEXT};font-size:22px;font-weight:600;line-height:1.2;">
                Estás dentro.
              </h2>
              <p style="margin:0 0 16px;color:${TEXT};font-size:14px;line-height:1.6;">
                Gracias por anotarte a la lista de <strong>${label}</strong>. ${nextStep}
              </p>
              <p style="margin:0 0 24px;color:${MUTED};font-size:14px;line-height:1.6;">
                Cuando tengamos novedades, te escribimos a este correo. Sin spam, sin promesas vacías.
              </p>
              <a
                href="${args.appUrl}"
                style="display:inline-block;background:${PRIMARY};color:#000;padding:12px 20px;text-decoration:none;border-radius:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;font-size:13px;"
              >
                Ir a la app
              </a>
            </td>
          </tr>
        </table>
        <p style="margin:24px 0 0;color:${MUTED};font-size:11px;text-align:center;line-height:1.6;">
          Te llegó este mail porque te anotaste en lapizarra.app. <br />
          <a href="${args.unsubscribeUrl}" style="color:${MUTED};text-decoration:underline;">Darme de baja</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`

  return { subject, html }
}
