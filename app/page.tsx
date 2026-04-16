import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function WelcomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect("/home")

  return (
    <div className="min-h-[100dvh] bg-black flex flex-col relative overflow-hidden">
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      {/* Accent haze top */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#D7FF00]/[0.05] to-transparent pointer-events-none" />
      {/* Stadium green bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-72 bg-gradient-to-t from-emerald-950/30 to-transparent pointer-events-none" />

      {/* Branding */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 pt-16">
        <div className="mb-2">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/30 font-sans mb-4">
            Fútbol amateur · 2026
          </p>
          <h1 className="font-display text-[76px] leading-none text-white">LA</h1>
          <h1 className="font-display text-[76px] leading-none text-[#D7FF00] -mt-2">PIZARRA</h1>
          <div className="h-0.5 w-12 bg-[#D7FF00] mt-5 mb-6" />
          <p className="text-white/40 text-base leading-relaxed max-w-[260px] font-sans">
            Gestión de equipos, partidos y estadísticas para fútbol amateur.
          </p>
        </div>
      </div>

      {/* CTAs */}
      <div className="relative z-10 px-6 pb-12 space-y-3">
        <Link
          href="/onboarding/create-team"
          className="flex items-center justify-center w-full bg-[#D7FF00] text-black py-[17px] rounded-xl font-display text-xl uppercase tracking-wide hover:bg-[#BFE600] active:scale-[0.98] transition-all"
        >
          Crear equipo
        </Link>

        <Link
          href="/auth/login"
          className="flex items-center justify-center w-full border border-white/15 text-white py-[17px] rounded-xl font-display text-xl uppercase tracking-wide hover:border-white/30 hover:text-white active:scale-[0.98] transition-all"
        >
          Iniciar sesión
        </Link>

        <div className="text-center pt-2">
          <Link
            href="/onboarding/join-team"
            className="text-sm text-white/30 hover:text-white/60 transition-colors font-sans"
          >
            Tengo un código de invitación →
          </Link>
        </div>
      </div>
    </div>
  )
}
