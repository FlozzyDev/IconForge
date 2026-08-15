import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { PotraceColorSettings } from "@/types"
import { POTRACE_COLOR_PRESETS } from "@/lib/potraceColorPresets"

function sv(v: number | readonly number[]): number {
  return typeof v === "number" ? v : v[0] ?? 0
}

interface PotraceColorSettingsPanelProps {
  settings: PotraceColorSettings
  onChange: (partial: Partial<PotraceColorSettings>) => void
}

export function PotraceColorSettingsPanel({
  settings,
  onChange,
}: PotraceColorSettingsPanelProps) {
  function matchesPreset(preset: PotraceColorSettings): boolean {
    return (
      settings.n_colors === preset.n_colors &&
      settings.upscale_factor === preset.upscale_factor &&
      settings.smoothing === preset.smoothing &&
      settings.smooth_spatial_radius === preset.smooth_spatial_radius &&
      settings.smooth_color_radius === preset.smooth_color_radius &&
      settings.alpha_threshold === preset.alpha_threshold &&
      settings.min_region_pixels === preset.min_region_pixels &&
      settings.merge_color_distance === preset.merge_color_distance &&
      settings.mask_cleanup === preset.mask_cleanup &&
      settings.turdsize === preset.turdsize &&
      settings.alphamax === preset.alphamax &&
      settings.opttolerance === preset.opttolerance &&
      settings.longcurve === preset.longcurve
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Presets</label>
        <div className="flex flex-wrap gap-2">
          {POTRACE_COLOR_PRESETS.map((preset) => {
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-sm">Upscale Factor</label>
          <Select
            value={String(settings.upscale_factor)}
            onValueChange={(v) =>
              v && onChange({ upscale_factor: Number(v) as 1 | 2 | 3 | 4 })
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1× (no upscale)</SelectItem>
              <SelectItem value="2">2×</SelectItem>
              <SelectItem value="3">3× (default)</SelectItem>
              <SelectItem value="4">4× (highest)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm">Smoothing</label>
          <Select
            value={settings.smoothing}
            onValueChange={(v) =>
              v && onChange({ smoothing: v as "none" | "bilateral" | "mean_shift" })
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mean_shift">Mean-shift (best)</SelectItem>
              <SelectItem value="bilateral">Bilateral (faster)</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Palette Size (colors)</span>
          <span className="text-muted-foreground">{settings.n_colors}</span>
        </div>
        <Slider
          value={[settings.n_colors]}
          min={2}
          max={16}
          step={1}
          onValueChange={(v) => onChange({ n_colors: sv(v) })}
        />
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Smooth Spatial Radius</span>
          <span className="text-muted-foreground">
            {settings.smooth_spatial_radius}
          </span>
        </div>
        <Slider
          value={[settings.smooth_spatial_radius]}
          min={5}
          max={50}
          step={1}
          onValueChange={(v) => onChange({ smooth_spatial_radius: sv(v) })}
        />
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Smooth Color Radius</span>
          <span className="text-muted-foreground">
            {settings.smooth_color_radius}
          </span>
        </div>
        <Slider
          value={[settings.smooth_color_radius]}
          min={5}
          max={50}
          step={1}
          onValueChange={(v) => onChange({ smooth_color_radius: sv(v) })}
        />
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Alpha Threshold</span>
          <span className="text-muted-foreground">{settings.alpha_threshold}</span>
        </div>
        <Slider
          value={[settings.alpha_threshold]}
          min={0}
          max={255}
          step={1}
          onValueChange={(v) => onChange({ alpha_threshold: sv(v) })}
        />
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Min Region Pixels</span>
          <span className="text-muted-foreground">
            {settings.min_region_pixels}
          </span>
        </div>
        <Slider
          value={[settings.min_region_pixels]}
          min={0}
          max={500}
          step={1}
          onValueChange={(v) => onChange({ min_region_pixels: sv(v) })}
        />
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Color Merge Distance (0 = off)</span>
          <span className="text-muted-foreground">
            {settings.merge_color_distance}
          </span>
        </div>
        <Slider
          value={[settings.merge_color_distance]}
          min={0}
          max={40}
          step={1}
          onValueChange={(v) => onChange({ merge_color_distance: sv(v) })}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Combines palette colors that are perceptually close — fewer, cleaner
          layers.
        </p>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="text-sm">Mask Cleanup</span>
          <p className="text-xs text-muted-foreground">
            Removes pixel islands and smooths ragged region edges before
            tracing.
          </p>
        </div>
        <Switch
          checked={settings.mask_cleanup}
          onCheckedChange={(v) => onChange({ mask_cleanup: v })}
        />
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Potrace turdsize</span>
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
          <span>Potrace alphamax</span>
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
