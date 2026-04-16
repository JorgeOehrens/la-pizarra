import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/app-shell"
import { features } from "@/lib/features"
import { TrainingView, type TrainingSession } from "./training-view"

function getWeekBounds(): { start: string; end: string } {
  const now  = new Date()
  const day  = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const mon  = new Date(now)
  mon.setDate(diff)
  mon.setHours(0, 0, 0, 0)
  const sun = new Date(mon)
  sun.setDate(sun.getDate() + 6)
  return {
    start: mon.toISOString().split("T")[0],
    end:   sun.toISOString().split("T")[0],
  }
}

export default async function TrainingPage() {
  if (!features.training) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { start, end } = getWeekBounds()

  const [allRes, weekRes] = await Promise.all([
    supabase
      .from("training_sessions")
      .select("id, session_type, title, session_date, duration_minutes, distance_km, calories, intensity, source, notes")
      .eq("user_id", user.id)
      .order("session_date", { ascending: false })
      .limit(60),

    supabase
      .from("training_sessions")
      .select("duration_minutes, distance_km")
      .eq("user_id", user.id)
      .gte("session_date", start)
      .lte("session_date", end),
  ])

  const sessions = (allRes.data ?? []) as TrainingSession[]

  const weekRows = weekRes.data ?? []
  const thisWeek = {
    sessions: weekRows.length,
    duration: weekRows.reduce((s, r) => s + (r.duration_minutes ?? 0), 0),
    distance: Math.round(
      weekRows.reduce((s, r) => s + Number(r.distance_km ?? 0), 0) * 10
    ) / 10,
  }

  const allTime = {
    sessions: sessions.length,
    distance: Math.round(
      sessions.reduce((s, r) => s + Number(r.distance_km ?? 0), 0) * 10
    ) / 10,
  }

  return (
    <AppShell>
      <div className="min-h-full bg-black relative">
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="fixed top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#D7FF00]/[0.04] to-transparent pointer-events-none" />
        <TrainingView sessions={sessions} thisWeek={thisWeek} allTime={allTime} />
      </div>
    </AppShell>
  )
}
