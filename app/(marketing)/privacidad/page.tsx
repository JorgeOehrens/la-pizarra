import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacidad · LaPizarra',
  description:
    'Política de privacidad de LaPizarra. Qué datos recolectamos, para qué los usamos y tus derechos.',
}

export default function PrivacidadPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 md:py-24">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-3">Legal</p>
      <h1 className="font-display text-4xl md:text-5xl leading-tight mb-3">Privacidad</h1>
      <p className="text-xs text-white/40 mb-12">
        Última actualización: 2026-04-26 · Versión inicial — sujeta a revisión legal.
      </p>

      <div className="space-y-8 text-sm md:text-base text-white/75 leading-relaxed">
        <section>
          <h2 className="font-display text-xl text-white mb-3">1. Quién es responsable</h2>
          <p>
            LaPizarra es responsable del tratamiento de los datos que carga el usuario en la
            plataforma. Si tenés consultas sobre privacidad, escríbenos a{' '}
            <a href="mailto:hola@lapizarra.app" className="text-accent underline">hola@lapizarra.app</a>.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-white mb-3">2. Qué datos recolectamos</h2>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><span className="text-white">Datos de cuenta</span>: usuario, contraseña (hasheada), email opcional, nombre visible.</li>
            <li><span className="text-white">Datos de fútbol</span>: equipos, plantilla, partidos, eventos, asistencia, finanzas internas.</li>
            <li><span className="text-white">Datos de uso</span>: páginas visitadas, dispositivo, navegador, IP aproximada.</li>
            <li><span className="text-white">Lista de espera</span>: email + audiencia + página de origen.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl text-white mb-3">3. Para qué los usamos</h2>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>Operar el Servicio (mostrar tu equipo, calcular stats, etc.).</li>
            <li>Enviarte comunicaciones operativas (confirmación de waitlist, novedades de tu liga).</li>
            <li>Mejorar el producto vía métricas agregadas y anónimas.</li>
            <li>Cumplir obligaciones legales.</li>
          </ul>
          <p className="mt-3">
            <span className="text-white">No vendemos tus datos a terceros.</span> No usamos tus datos
            para entrenar modelos de IA externos sin tu consentimiento.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-white mb-3">4. Con quién los compartimos</h2>
          <p>
            Trabajamos con proveedores que procesan datos en nuestro nombre, bajo acuerdos de
            confidencialidad y seguridad:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2 mt-3">
            <li><span className="text-white">Supabase</span> — base de datos y autenticación.</li>
            <li><span className="text-white">Vercel</span> — hosting y analytics agregados.</li>
            <li><span className="text-white">Resend</span> — envío de email transaccional.</li>
            <li><span className="text-white">Stripe / Fintoc</span> — procesamiento de pagos (cuando se active Pro Liga).</li>
          </ul>
          <p className="mt-3">
            No compartimos datos con anunciantes ni redes sociales fuera de los pixels estándar de
            las plataformas, si en algún momento los usamos.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-white mb-3">5. Cookies y sesión</h2>
          <p>
            Usamos cookies esenciales para mantener la sesión iniciada (Supabase Auth) y para
            prevenir abuso del Servicio. No usamos cookies de tracking publicitario.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-white mb-3">6. Retención</h2>
          <p>
            Mantenemos tus datos mientras tu cuenta esté activa. Si cerrás la cuenta, podemos
            retener cierta información por motivos legales o contables (ej. registros de pagos).
            Las listas de espera se eliminan cuando se solicita la baja o tras 24 meses de
            inactividad.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-white mb-3">7. Tus derechos</h2>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><span className="text-white">Acceso</span>: pedir copia de tus datos.</li>
            <li><span className="text-white">Rectificación</span>: corregir datos incorrectos.</li>
            <li><span className="text-white">Eliminación</span>: cerrar tu cuenta y borrar tus datos personales.</li>
            <li><span className="text-white">Oposición</span>: pedir que dejemos de procesarlos para fines no esenciales.</li>
            <li><span className="text-white">Baja del waitlist</span>: cada email tiene un link de unsubscribe que también podés usar manualmente.</li>
          </ul>
          <p className="mt-3">
            Para ejercerlos, escribinos a <a href="mailto:hola@lapizarra.app" className="text-accent underline">hola@lapizarra.app</a> con tu usuario o email.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-white mb-3">8. Seguridad</h2>
          <p>
            Aplicamos medidas técnicas razonables: HTTPS, RLS en base de datos, contraseñas
            hasheadas, principio de menor privilegio. Ningún sistema es 100% infalible; si detectamos
            una brecha que te afecte, te avisaremos.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-white mb-3">9. Menores de edad</h2>
          <p>
            LaPizarra no está dirigida a menores de 13 años. Si sos padre/tutor y detectás que un
            menor creó cuenta sin tu consentimiento, escribinos para eliminarla.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-white mb-3">10. Cambios a esta política</h2>
          <p>
            Podemos actualizar esta política. Cuando hagamos cambios materiales te avisaremos por
            email o dentro de la app. La fecha de &quot;Última actualización&quot; al inicio de esta
            página indica la versión vigente.
          </p>
        </section>

        <section className="border-t border-border/30 pt-6 mt-10">
          <p className="text-xs text-white/40 italic leading-relaxed">
            Esta versión es inicial y de carácter informativo. Antes del lanzamiento de Pro Liga
            será revisada por un asesor legal. Si tenés comentarios, escribinos.
          </p>
        </section>
      </div>
    </div>
  )
}
