import type { ServiceId } from "@/types"

const NAV: { id: ServiceId; label: string }[] = [
  { id: "background", label: "Background Removal" },
  { id: "silhouette", label: "Silhouette SVG" },
  { id: "colorSvg", label: "Color SVG" },
  { id: "webp", label: "WebP" },
  { id: "outputs", label: "Outputs" },
]

interface AppLayoutProps {
  active: ServiceId
  onNavigate: (id: ServiceId) => void
  children: React.ReactNode
}

export function AppLayout({ active, onNavigate, children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-wrap items-center gap-x-6 gap-y-3">
          <h1 className="text-xl font-semibold">
            IconForge<span className="text-primary">.</span>
          </h1>
          <nav className="flex flex-wrap gap-1">
            {NAV.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                className={`
                  px-3 py-1.5 text-sm rounded-md transition-colors
                  ${
                    active === id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }
                `}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
