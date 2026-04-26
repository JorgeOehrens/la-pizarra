import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Globe, Lock, Settings, Trophy, UserCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  league: {
    slug: string
    name: string
    logo_url: string | null
    primary_color: string
    secondary_color: string
    visibility: 'public' | 'unlisted' | 'private'
    join_mode: 'open' | 'request' | 'invite_only'
    description?: string | null
  }
  /** Page subtitle. If omitted, the league description is shown. */
  subtitle?: string | null
  /** Where the back arrow points. Defaults to /home. */
  backHref?: string
  /** Override back-arrow label (mobile). */
  backLabel?: string
  /** Show the settings cog (admin only). */
  isAdmin?: boolean
  /** Render a hero (large) header instead of a slim one. */
  hero?: boolean
}

const VIS_LABEL: Record<Props['league']['visibility'], { label: string; icon: typeof Globe }> = {
  public:   { label: 'Pública',     icon: Globe },
  unlisted: { label: 'No listada',  icon: Lock },
  private:  { label: 'Privada',     icon: Lock },
}

const JOIN_LABEL: Record<Props['league']['join_mode'], { label: string; icon: typeof Globe }> = {
  open:        { label: 'Abierta',          icon: Globe },
  request:     { label: 'Por solicitud',    icon: UserCheck },
  invite_only: { label: 'Solo invitación',  icon: Lock },
}

export function LeagueHeader({
  league,
  subtitle,
  backHref = '/home',
  backLabel = 'Volver',
  isAdmin = false,
  hero = false,
}: Props) {
  const primary = league.primary_color || '#16a34a'
  const secondary = league.secondary_color || '#ffffff'
  const VisIcon = VIS_LABEL[league.visibility].icon
  const JoinIcon = JOIN_LABEL[league.join_mode].icon

  if (!hero) {
    // Slim header — used by subpages that have their own page title.
    return (
      <header className="sticky top-0 z-30 -mx-4 px-4 py-3 bg-background/95 backdrop-blur-sm border-b border-border/30 mb-5">
        <div className="flex items-center justify-between">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xs uppercase tracking-widest">{backLabel}</span>
          </Link>

          <Link href={`/league/${league.slug}`} className="flex items-center gap-2 min-w-0">
            {league.logo_url ? (
              <Image src={league.logo_url} alt={league.name} width={24} height={24} className="rounded shrink-0 object-cover" />
            ) : (
              <div
                className="w-6 h-6 rounded flex items-center justify-center shrink-0"
                style={{ backgroundColor: primary, color: secondary }}
              >
                <Trophy className="h-3 w-3" />
              </div>
            )}
            <span className="text-sm font-medium truncate max-w-[140px]">{league.name}</span>
          </Link>

          {isAdmin && (
            <Link
              href={`/league/${league.slug}/settings`}
              className="p-2 -mr-2 text-muted-foreground hover:text-foreground"
              aria-label="Configuración"
            >
              <Settings className="h-4 w-4" />
            </Link>
          )}
        </div>
      </header>
    )
  }

  // Hero header — used by the league dashboard page.
  return (
    <div className="-mx-4 mb-6">
      <div
        className="relative px-4 pt-4 pb-6 overflow-hidden"
        style={{
          backgroundColor: primary,
          color: secondary,
        }}
      >
        {/* Subtle dot grid for texture */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, ${secondary}55 1px, transparent 1px)`,
            backgroundSize: '14px 14px',
          }}
        />

        <div className="relative flex items-center justify-between mb-4">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 opacity-80 hover:opacity-100"
            style={{ color: secondary }}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xs uppercase tracking-widest">{backLabel}</span>
          </Link>
          {isAdmin && (
            <Link
              href={`/league/${league.slug}/settings`}
              className="p-2 -mr-2 opacity-80 hover:opacity-100"
              style={{ color: secondary }}
              aria-label="Configuración"
            >
              <Settings className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="relative flex items-end gap-4">
          {league.logo_url ? (
            <Image
              src={league.logo_url}
              alt={league.name}
              width={72}
              height={72}
              className="rounded-2xl object-cover shrink-0"
            />
          ) : (
            <div
              className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: secondary, color: primary }}
            >
              <Trophy className="h-9 w-9" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p
              className="text-[10px] uppercase tracking-[0.2em] mb-0.5 opacity-70"
              style={{ color: secondary }}
            >
              Liga
            </p>
            <h1 className="font-display text-3xl leading-[1.05] truncate" style={{ color: secondary }}>
              {league.name}
            </h1>
          </div>
        </div>

        {(subtitle ?? league.description) && (
          <p
            className="relative mt-3 text-sm leading-snug max-w-[340px] opacity-85"
            style={{ color: secondary }}
          >
            {subtitle ?? league.description}
          </p>
        )}

        <div className="relative flex flex-wrap gap-2 mt-4">
          <Pill icon={VisIcon} label={VIS_LABEL[league.visibility].label} primary={primary} secondary={secondary} />
          <Pill icon={JoinIcon} label={JOIN_LABEL[league.join_mode].label} primary={primary} secondary={secondary} />
        </div>
      </div>
    </div>
  )
}

function Pill({
  icon: Icon,
  label,
  primary,
  secondary,
}: {
  icon: typeof Globe
  label: string
  primary: string
  secondary: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase tracking-widest',
      )}
      style={{
        backgroundColor: secondary + '22',
        color: secondary,
      }}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  )
}
