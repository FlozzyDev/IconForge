import { ServicePage } from "@/components/shared/ServicePage"
import { BgModelPicker } from "@/components/shared/BgModelPicker"
import type { AppSettings } from "@/types"
import * as api from "@/services/api"

interface BackgroundRemovalServiceProps {
  settings: AppSettings
  onSettingsChange: (settings: AppSettings) => void
}

export function BackgroundRemovalService({
  settings,
  onSettingsChange,
}: BackgroundRemovalServiceProps) {
  return (
    <ServicePage
      title="Background Removal"
      description="Strip the background from input images. Results land in output/background_removed as transparent PNGs, ready for the SVG or WebP services."
      sourceDirs={[{ id: "input", label: "Input Folder" }]}
      resultDirectory="background_removed"
      runLabel="Remove Backgrounds"
      process={(filename) =>
        api.processBackground(
          filename,
          settings.bgSettings.modelType,
          settings.bgSettings.modelName,
          settings.bgSettings.mode
        )
      }
      settingsPanel={
        <BgModelPicker
          settings={settings.bgSettings}
          onChange={(partial) =>
            onSettingsChange({
              ...settings,
              bgSettings: { ...settings.bgSettings, ...partial },
            })
          }
        />
      }
    />
  )
}
