import { useEffect, useState } from "react"
import { ServicePage } from "@/components/shared/ServicePage"
import { SilhouetteSettingsPanel } from "@/components/settings/SilhouetteSettingsPanel"
import type { AppSettings } from "@/types"
import * as api from "@/services/api"

interface SilhouetteServiceProps {
  settings: AppSettings
  onSettingsChange: (settings: AppSettings) => void
}

export function SilhouetteService({
  settings,
  onSettingsChange,
}: SilhouetteServiceProps) {
  const [available, setAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    api
      .checkPotrace()
      .then((r) => setAvailable(r.available))
      .catch(() => setAvailable(false))
  }, [])

  return (
    <ServicePage
      title="Silhouette SVG"
      description="Trace the alpha channel into a monochrome vector outline (Potrace). Sources need transparency — run Background Removal first for opaque images. Results land in output/silhouette."
      sourceDirs={[
        { id: "background_removed", label: "Background Removed" },
        { id: "input", label: "Input Folder" },
      ]}
      resultDirectory="silhouette"
      runLabel="Trace Silhouettes"
      available={available}
      unavailableReason="Potrace is not available on the backend (check POTRACE_PATH in .env)."
      process={(filename) => api.convertToSvg(filename, settings.svgSettings)}
      settingsPanel={
        <SilhouetteSettingsPanel
          settings={settings.svgSettings}
          onChange={(partial) =>
            onSettingsChange({
              ...settings,
              svgSettings: { ...settings.svgSettings, ...partial },
            })
          }
        />
      }
    />
  )
}
