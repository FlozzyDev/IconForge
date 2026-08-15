import { useEffect, useState } from "react"
import { ServicePage } from "@/components/shared/ServicePage"
import { ColorSVGSettingsPanel } from "@/components/settings/ColorSVGSettingsPanel"
import { PotraceColorSettingsPanel } from "@/components/settings/PotraceColorSettingsPanel"
import type { AppSettings, ColorEngine } from "@/types"
import * as api from "@/services/api"

interface ColorSVGServiceProps {
  settings: AppSettings
  onSettingsChange: (settings: AppSettings) => void
}

export function ColorSVGService({
  settings,
  onSettingsChange,
}: ColorSVGServiceProps) {
  const [vtracerAvailable, setVtracerAvailable] = useState<boolean | null>(null)
  const [potraceAvailable, setPotraceAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    api
      .checkVtracer()
      .then((r) => setVtracerAvailable(r.available))
      .catch(() => setVtracerAvailable(false))
    api
      .checkPotraceColor()
      .then((r) => setPotraceAvailable(r.available))
      .catch(() => setPotraceAvailable(false))
  }, [])

  const engine = settings.colorEngine
  const available = engine === "fast" ? vtracerAvailable : potraceAvailable

  const engines: { id: ColorEngine; label: string; desc: string }[] = [
    {
      id: "fast",
      label: "Fast (VTracer)",
      desc: "Multi-path colored vector. Quick, preserves palette.",
    },
    {
      id: "precision",
      label: "Precision (AA-aware Potrace)",
      desc: "Upscale + smooth + per-color trace. Cleaner edges, slower.",
    },
  ]

  return (
    <ServicePage
      title="Color SVG"
      description="Vectorize images into colored SVGs. Results land in output/color_svg."
      sourceDirs={[
        { id: "input", label: "Input Folder" },
        { id: "background_removed", label: "Background Removed" },
      ]}
      resultDirectory="color_svg"
      runLabel="Vectorize"
      available={available}
      unavailableReason={
        engine === "fast"
          ? "vtracer is not installed on the backend."
          : "Potrace is not available on the backend (check POTRACE_PATH in .env)."
      }
      process={(filename) =>
        engine === "fast"
          ? api.convertColorSVG(filename, settings.colorSVGSettings)
          : api.convertPotraceColor(filename, settings.potraceColorSettings)
      }
      settingsPanel={
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Engine</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {engines.map(({ id, label, desc }) => {
                const active = engine === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() =>
                      onSettingsChange({ ...settings, colorEngine: id })
                    }
                    className={`
                      text-left p-3 rounded-lg border-2 transition-all
                      ${
                        active
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }
                    `}
                  >
                    <span className="font-medium text-sm">{label}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {engine === "fast" ? (
            <ColorSVGSettingsPanel
              settings={settings.colorSVGSettings}
              onChange={(partial) =>
                onSettingsChange({
                  ...settings,
                  colorSVGSettings: {
                    ...settings.colorSVGSettings,
                    ...partial,
                  },
                })
              }
            />
          ) : (
            <PotraceColorSettingsPanel
              settings={settings.potraceColorSettings}
              onChange={(partial) =>
                onSettingsChange({
                  ...settings,
                  potraceColorSettings: {
                    ...settings.potraceColorSettings,
                    ...partial,
                  },
                })
              }
            />
          )}
        </div>
      }
    />
  )
}
