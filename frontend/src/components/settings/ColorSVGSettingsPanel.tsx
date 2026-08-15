import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ColorSVGSettings } from "@/types"
import { COLOR_SVG_PRESETS } from "@/lib/colorSVGPresets"

function sv(v: number | readonly number[]): number {
  return typeof v === "number" ? v : v[0] ?? 0
}

interface ColorSVGSettingsPanelProps {
  settings: ColorSVGSettings
  onChange: (partial: Partial<ColorSVGSettings>) => void
}

export function ColorSVGSettingsPanel({
  settings,
  onChange,
}: ColorSVGSettingsPanelProps) {
  function matchesPreset(preset: ColorSVGSettings): boolean {
    return (
      settings.colormode === preset.colormode &&
      settings.hierarchical === preset.hierarchical &&
      settings.mode === preset.mode &&
      settings.filter_speckle === preset.filter_speckle &&
      settings.color_precision === preset.color_precision &&
      settings.layer_difference === preset.layer_difference &&
      settings.corner_threshold === preset.corner_threshold &&
      settings.length_threshold === preset.length_threshold &&
      settings.splice_threshold === preset.splice_threshold &&
      settings.path_precision === preset.path_precision
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Presets</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_SVG_PRESETS.map((preset) => {
            const active = matchesPreset(preset.settings)
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onChange(preset.settings)}
                title={preset.description}
                className={`
                  px-3 py-1.5 text-xs rounded-full border transition-colors
                  ${
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-primary/50 hover:bg-accent"
                  }
                `}
              >
                {preset.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-sm">Color Mode</label>
          <Select
            value={settings.colormode}
            onValueChange={(v) =>
              v && onChange({ colormode: v as "color" | "binary" })
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="color">Color</SelectItem>
              <SelectItem value="binary">Binary</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm">Shape Layering</label>
          <Select
            value={settings.hierarchical}
            onValueChange={(v) =>
              v && onChange({ hierarchical: v as "stacked" | "cutout" })
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cutout">Cutout (editable)</SelectItem>
              <SelectItem value="stacked">Stacked (layered)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm">Curve Fit</label>
          <Select
            value={settings.mode}
            onValueChange={(v) =>
              v && onChange({ mode: v as "spline" | "polygon" | "none" })
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spline">Spline</SelectItem>
              <SelectItem value="polygon">Polygon</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Noise Filter (filter_speckle)</span>
          <span className="text-muted-foreground">{settings.filter_speckle}</span>
        </div>
        <Slider
          value={[settings.filter_speckle]}
          min={0}
          max={100}
          step={1}
          onValueChange={(v) => onChange({ filter_speckle: sv(v) })}
        />
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Color Precision (bits)</span>
          <span className="text-muted-foreground">{settings.color_precision}</span>
        </div>
        <Slider
          value={[settings.color_precision]}
          min={1}
          max={8}
          step={1}
          onValueChange={(v) => onChange({ color_precision: sv(v) })}
        />
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Layer Difference</span>
          <span className="text-muted-foreground">{settings.layer_difference}</span>
        </div>
        <Slider
          value={[settings.layer_difference]}
          min={0}
          max={256}
          step={1}
          onValueChange={(v) => onChange({ layer_difference: sv(v) })}
        />
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Corner Threshold (°)</span>
          <span className="text-muted-foreground">{settings.corner_threshold}</span>
        </div>
        <Slider
          value={[settings.corner_threshold]}
          min={0}
          max={180}
          step={1}
          onValueChange={(v) => onChange({ corner_threshold: sv(v) })}
        />
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Length Threshold</span>
          <span className="text-muted-foreground">
            {settings.length_threshold.toFixed(1)}
          </span>
        </div>
        <Slider
          value={[settings.length_threshold]}
          min={3.5}
          max={10}
          step={0.1}
          onValueChange={(v) => onChange({ length_threshold: sv(v) })}
        />
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Splice Threshold (°)</span>
          <span className="text-muted-foreground">{settings.splice_threshold}</span>
        </div>
        <Slider
          value={[settings.splice_threshold]}
          min={0}
          max={180}
          step={1}
          onValueChange={(v) => onChange({ splice_threshold: sv(v) })}
        />
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Path Precision</span>
          <span className="text-muted-foreground">{settings.path_precision}</span>
        </div>
        <Slider
          value={[settings.path_precision]}
          min={1}
          max={16}
          step={1}
          onValueChange={(v) => onChange({ path_precision: sv(v) })}
        />
      </div>
    </div>
  )
}
