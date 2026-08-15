import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import type { SilhouetteSettings } from "@/types"

function sv(v: number | readonly number[]): number {
  return typeof v === "number" ? v : v[0] ?? 0
}

interface SilhouetteSettingsPanelProps {
  settings: SilhouetteSettings
  onChange: (partial: Partial<SilhouetteSettings>) => void
}

export function SilhouetteSettingsPanel({
  settings,
  onChange,
}: SilhouetteSettingsPanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Threshold</span>
          <span className="text-muted-foreground">{settings.threshold}</span>
        </div>
        <Slider
          value={[settings.threshold]}
          min={0}
          max={255}
          step={1}
          onValueChange={(v) => onChange({ threshold: sv(v) })}
        />
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Detail Level</span>
          <span className="text-muted-foreground">{settings.turdsize}</span>
        </div>
        <Slider
          value={[settings.turdsize]}
          min={0}
          max={100}
          step={1}
          onValueChange={(v) => onChange({ turdsize: sv(v) })}
        />
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Corner Smoothing</span>
          <span className="text-muted-foreground">{settings.alphamax}</span>
        </div>
        <Slider
          value={[settings.alphamax]}
          min={0}
          max={2}
          step={0.1}
          onValueChange={(v) => onChange({ alphamax: sv(v) })}
        />
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Curve Simplification (higher = fewer anchors)</span>
          <span className="text-muted-foreground">{settings.opttolerance}</span>
        </div>
        <Slider
          value={[settings.opttolerance]}
          min={0}
          max={2}
          step={0.05}
          onValueChange={(v) => onChange({ opttolerance: sv(v) })}
        />
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Scale</span>
          <span className="text-muted-foreground">{settings.scale}</span>
        </div>
        <Slider
          value={[settings.scale]}
          min={0.1}
          max={10}
          step={0.1}
          onValueChange={(v) => onChange({ scale: sv(v) })}
        />
      </div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="text-sm">Raw Segments</span>
          <p className="text-xs text-muted-foreground">
            Disables Potrace's curve merging — many more anchor points. Leave
            off for editable output.
          </p>
        </div>
        <Switch
          checked={settings.longcurve}
          onCheckedChange={(v) => onChange({ longcurve: v })}
        />
      </div>
    </div>
  )
}
