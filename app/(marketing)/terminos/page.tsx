import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos de uso · LaPizarra',
  description:
    'Términos de uso del servicio LaPizarra. Versión inicial — sujeta a revisión legal.',
}

export default function TerminosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 md:py-24">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-3">Legal</p>
      <h1 className="font-display text-4xl md:text-5xl leading-tight mb-3">Términos de uso</h1>
      <p className="text-xs text-white/40 mb-12">
        Última actualización: 2026-04-26 · Versión inicial — sujeta a revisión legal.
      </p>

      <div className="space-y-8 text-sm md:text-base text-white/75 leading-relaxed">
        <section>
          <h2 className="font-display text-xl text-white mb-3">1. Aceptación</h2>
          <p>
            Al usar LaPizarra (el &quot;Servicio&quot;) aceptas estos términos. Si no estás de acuerdo,
            no uses el Servicio. LaPizarra puede modificar los términos; te avisaremos por email o
            dentro de la app cuando haya cambios materiales.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-white mb-3">2. Descripción del Servicio</h2>
          <p>
            LaPizarra es una plataforma para gestionar equipos, partidos, estadísticas, asistencia,
            finanzas internas y, en versiones futuras, ligas y torneos amateur. El Servicio se ofrece
            &quot;tal cual&quot;, sin garantía de disponibilidad continua.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-white mb-3">3. Cuentas y responsabilidad</h2>
          <p>
            Sos responsable de la actividad realizada bajo tu cuenta y de mantener tu contraseña a
            salvo. Si detectás un acceso no autorizado, debés notificarnos a la brevedad. La cuenta
            es personal y no puede transferirse a terceros sin nuestro consentimiento.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-white mb-3">4. Contenido del usuario</h2>
          <p>
            El contenido que subas (logos, plantillas, eventos, comentarios) sigue siendo tuyo o de
            la organización a la que perteneces. Nos otorgás una licencia limitada para alojarlo,
            mostrarlo dentro del Servicio y procesarlo para que la app funcione. Sos responsable de
            tener los permisos necesarios para subirlo.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-white mb-3">5. Uso aceptable</h2>
          <p>
            No podés usar LaPizarra para actividades ilegales, abusivas, discriminatorias, ni para
            cargar contenido que viole derechos de terceros. Tampoco podés intentar comprometer la
            seguridad del Servicio ni hacer ingeniería inversa.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-white mb-3">6. Pagos (futuros)</h2>
          <p>
            Pro Liga es un plan de pago anual ($10.000 CLP / año / liga al lanzamiento). Mientras
            esté en lista de espera, no se cobra. Cuando habilitemos cobros tendrás un período de
            prueba antes de cualquier débito. Los términos comerciales específicos se entregarán al
            momento de activación.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-white mb-3">7. Disponibilidad</h2>
          <p>
            Hacemos todo lo posible para mantener el Servicio disponible, pero no garantizamos un
            uptime específico. Podemos hacer mantenimiento programado o emergente sin aviso previo.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-white mb-3">8. Terminación</h2>
          <p>
            Podemos suspender o terminar tu cuenta si violás estos términos. Vos podés cerrar tu
            cuenta cuando quieras. Si terminamos tu cuenta por inactividad o incumplimiento, te
            avisaremos por email para que puedas exportar tus datos.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-white mb-3">9. Limitación de responsabilidad</h2>
          <p>
            En la medida permitida por la ley, LaPizarra no es responsable por daños indirectos,
            lucro cesante, ni pérdida de datos. Nuestra responsabilidad total se limita al monto
            pagado por el Servicio en los 12 meses anteriores al evento que dio origen al reclamo.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-white mb-3">10. Ley aplicable</h2>
          <p>
            Estos términos se rigen por las leyes de la jurisdicción de operación de LaPizarra
            (definida al lanzamiento). Cualquier disputa se resolverá en los tribunales competentes
            de esa jurisdicción.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-white mb-3">11. Contacto</h2>
          <p>
            Cualquier consulta sobre estos términos: <a href="mailto:hola@lapizarra.app" className="text-accent underline">hola@lapizarra.app</a>.
          </p>
        </section>

        <section className="border-t border-border/30 pt-6 mt-10">
          <p className="text-xs text-white/40 italic leading-relaxed">
            Esta versión es inicial y de carácter informativo. Antes del lanzamiento de Pro Liga
            será revisada por un asesor legal y reemplazada por la versión definitiva. Si tenés
            comentarios, escribinos a <a href="mailto:hola@lapizarra.app" className="text-white/60 underline">hola@lapizarra.app</a>.
          </p>
        </section>
      </div>
    </div>
  )
}
