import { useEffect, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { BackgroundSettings } from "@/types"
import * as api from "@/services/api"

interface BgModelPickerProps {
  settings: BackgroundSettings
  onChange: (partial: Partial<BackgroundSettings>) => void
  disabled?: boolean
}

export function BgModelPicker({ settings, onChange, disabled }: BgModelPickerProps) {
  const [rembgModels, setRembgModels] = useState<string[]>([])

  useEffect(() => {
    api.getModels().then((m) => setRembgModels(m.rembg)).catch(() => {})
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium">Model Type</label>
        <Select
          value={settings.modelType}
          onValueChange={(v) =>
            v && onChange({ modelType: v as "rembg" | "inspyrenet" })
          }
          disabled={disabled}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rembg">rembg</SelectItem>
            <SelectItem value="inspyrenet">InSPyReNet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {settings.modelType === "rembg" && rembgModels.length > 0 && (
        <div>
          <label className="text-sm font-medium">Model</label>
          <Select
            value={settings.modelName ?? undefined}
            onValueChange={(v) => v && onChange({ modelName: v })}
            disabled={disabled}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {rembgModels.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {settings.modelType === "inspyrenet" && (
        <div>
          <label className="text-sm font-medium">Mode</label>
          <Select
            value={settings.mode}
            onValueChange={(v) => v && onChange({ mode: v as "base" | "fast" })}
            disabled={disabled}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="base">Base (highest quality)</SelectItem>
              <SelectItem value="fast">Fast</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
