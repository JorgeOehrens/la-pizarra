import { AppShell } from "@/components/app-shell"
import { ChevronRight, User, Bell, Shield, LogOut, HelpCircle, Moon } from "lucide-react"
import Link from "next/link"

const menuItems = [
  { icon: User, label: "Editar perfil", href: "/profile/edit" },
  { icon: Bell, label: "Notificaciones", href: "/profile/notifications" },
  { icon: Shield, label: "Privacidad", href: "/profile/privacy" },
  { icon: Moon, label: "Apariencia", href: "/profile/appearance" },
  { icon: HelpCircle, label: "Ayuda", href: "/profile/help" },
]

export default function ProfilePage() {
  return (
    <AppShell>
      <div className="px-4 pt-6 pb-4">
        {/* Header */}
        <header className="mb-8">
          <h1 className="font-display text-3xl">Perfil</h1>
        </header>

        {/* User Card */}
        <div className="bg-card rounded-xl p-5 mb-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
              <span className="font-display text-2xl text-accent-foreground">CM</span>
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <h2 className="font-display text-xl">Carlos Martínez</h2>
              <p className="text-sm text-muted-foreground">Mediocampista · #10</p>
              <p className="text-xs text-accent mt-1">La Máquina FC</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-border">
            <div className="text-center">
              <p className="font-display text-2xl">42</p>
              <p className="text-[10px] text-muted-foreground uppercase">Partidos</p>
            </div>
            <div className="text-center">
              <p className="font-display text-2xl">15</p>
              <p className="text-[10px] text-muted-foreground uppercase">Goles</p>
            </div>
            <div className="text-center">
              <p className="font-display text-2xl">28</p>
              <p className="text-[10px] text-muted-foreground uppercase">Asistencias</p>
            </div>
          </div>
        </div>

        {/* Role Badge */}
        <div className="bg-accent/10 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Rol en el equipo</p>
            <p className="text-xs text-muted-foreground">Administrador</p>
          </div>
          <span className="px-3 py-1 bg-accent text-accent-foreground text-xs uppercase tracking-wider rounded-full">
            Admin
          </span>
        </div>

        {/* Menu */}
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-4 bg-card rounded-lg p-4 active:scale-[0.98] transition-transform"
            >
              <item.icon className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1 text-sm">{item.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <button className="w-full flex items-center gap-4 bg-card rounded-lg p-4 mt-6 text-destructive active:scale-[0.98] transition-transform">
          <LogOut className="h-5 w-5" />
          <span className="flex-1 text-sm text-left">Cerrar sesión</span>
        </button>

        {/* Version */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          LaPizarra v1.0.0
        </p>
      </div>
    </AppShell>
  )
}
