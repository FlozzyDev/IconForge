import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ServicePage } from "@/components/shared/ServicePage"
import type { AppSettings, RunItem } from "@/types"
import * as api from "@/services/api"

interface WebPServiceProps {
  settings: AppSettings
  onSettingsChange: (settings: AppSettings) => void
}

export function WebPService({ settings, onSettingsChange }: WebPServiceProps) {
  const [zipping, setZipping] = useState(false)
  const [zipError, setZipError] = useState<string | null>(null)

  async function downloadZip(done: RunItem[]) {
    const files = done
      .map((i) => i.result?.filename)
      .filter((f): f is string => Boolean(f))
    if (files.length === 0) return
    setZipping(true)
    setZipError(null)
    try {
      const blob = await api.exportZip(files)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "iconforge_export.zip"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setZipError(err instanceof Error ? err.message : "ZIP export failed")
    } finally {
      setZipping(false)
    }
  }

  return (
    <ServicePage
      title="WebP Convert"
      description="Convert images to icon-ready WebP (dimensions floored to the 8px grid). Results land in output/webp. Great final step after Background Removal for emote packs."
      sourceDirs={[
        { id: "input", label: "Input Folder" },
        { id: "background_removed", label: "Background Removed" },
      ]}
      resultDirectory="webp"
      runLabel="Convert to WebP"
      process={(filename) => api.exportWebp(filename, settings.webpQuality)}
      settingsPanel={
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Quality</span>
            <span className="text-muted-foreground">{settings.webpQuality}</span>
          </div>
          <Slider
            value={[settings.webpQuality]}
            min={1}
            max={100}
            step={1}
            onValueChange={(v) =>
              onSettingsChange({
                ...settings,
                webpQuality: typeof v === "number" ? v : v[0] ?? 90,
              })
            }
          />
        </div>
      }
      resultActions={(done) => (
        <div className="space-y-2">
          {zipError && <p className="text-sm text-destructive">{zipError}</p>}
          <Button
            onClick={() => void downloadZip(done)}
            disabled={zipping}
            className="w-full"
          >
            {zipping
              ? "Building ZIP..."
              : `Download All as ZIP (${done.length} WebP${done.length === 1 ? "" : "s"})`}
          </Button>
        </div>
      )}
    />
  )
}
