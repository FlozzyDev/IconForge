import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, Sparkles, Palette } from "lucide-react"
import type {
  ColorSVGSettings,
  OutputType,
  ProcessingOptions,
  SilhouetteSettings,
} from "@/types"
import * as api from "@/services/api"
import { COLOR_SVG_PRESETS } from "@/lib/colorSVGPresets"

interface OutputTypeStepProps {
  options: ProcessingOptions
  onOptionsChange: (options: ProcessingOptions) => void
  onNext: () => void
}

function sv(v: number | readonly number[]): number {
  return typeof v === "number" ? v : v[0] ?? 0
}

export function OutputTypeStep({
  options,
  onOptionsChange,
  onNext,
}: OutputTypeStepProps) {
  const [vtracerAvailable, setVtracerAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    api
      .checkVtracer()
      .then((r) => setVtracerAvailable(r.available))
      .catch(() => setVtracerAvailable(false))
  }, [])

  function selectType(type: OutputType) {
    onOptionsChange({ ...options, outputType: type })
  }

  function updateSvg(partial: Partial<SilhouetteSettings>) {
    onOptionsChange({
      ...options,
      svgSettings: { ...options.svgSettings, ...partial },
    })
  }

  function updateColor(partial: Partial<ColorSVGSettings>) {
    onOptionsChange({
      ...options,
      colorSVGSettings: { ...options.colorSVGSettings, ...partial },
    })
  }

  function applyColorPreset(settings: ColorSVGSettings) {
    onOptionsChange({ ...options, colorSVGSettings: settings })
  }

  function colorMatchesPreset(preset: ColorSVGSettings): boolean {
    const cur = options.colorSVGSettings
    return (
      cur.colormode === preset.colormode &&
      cur.hierarchical === preset.hierarchical &&
      cur.mode === preset.mode &&
      cur.filter_speckle === preset.filter_speckle &&
      cur.color_precision === preset.color_precision &&
      cur.layer_difference === preset.layer_difference &&
      cur.corner_threshold === preset.corner_threshold &&
      cur.length_threshold === preset.length_threshold &&
      cur.splice_threshold === preset.splice_threshold &&
      cur.path_precision === preset.path_precision
    )
  }

  function updateQuality(q: number) {
    onOptionsChange({ ...options, webpQuality: q })
  }

  const typeCards: {
    type: OutputType
    label: string
    desc: string
    icon: typeof ImageIcon
    disabled?: boolean
    disabledReason?: string
  }[] = [
    {
      type: "webp",
      label: "WebP",
      desc: "Flat raster image export. Smallest file, fast.",
      icon: ImageIcon,
    },
    {
      type: "silhouette",
      label: "Silhouette SVG",
      desc: "Monochrome vector outline via Potrace.",
      icon: Sparkles,
    },
    {
      type: "colorSVG",
      label: "Color SVG",
      desc: "Multi-path colored vector via VTracer. Preserves palette.",
      icon: Palette,
      disabled: vtracerAvailable === false,
      disabledReason: "vtracer not installed on backend",
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Choose Output Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {typeCards.map(({ type, label, desc, icon: Icon, disabled, disabledReason }) => {
              const active = options.outputType === type
              return (
                <button
                  key={type}
                  type="button"
                  disabled={disabled}
                  onClick={() => !disabled && selectType(type)}
                  className={`
                    text-left p-4 rounded-lg border-2 transition-all
                    ${active ? "border-primary bg-primary/5" : "border-border"}
                    ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary/50 cursor-pointer"}
                  `}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{label}</span>
                    {active && <Badge className="ml-auto">Selected</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                  {disabled && disabledReason && (
                    <p className="text-xs text-destructive mt-1">
                      {disabledReason}
                    </p>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {options.outputType === "webp" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">WebP Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Quality</span>
                <span className="text-muted-foreground">
                  {options.webpQuality}
                </span>
              </div>
              <Slider
                value={[options.webpQuality]}
                min={1}
                max={100}
                step={1}
                onValueChange={(v) => updateQuality(sv(v))}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {options.outputType === "silhouette" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Silhouette Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Threshold</span>
                <span className="text-muted-foreground">
                  {options.svgSettings.threshold}
                </span>
              </div>
              <Slider
                value={[options.svgSettings.threshold]}
                min={0}
                max={255}
                step={1}
                onValueChange={(v) => updateSvg({ threshold: sv(v) })}
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Detail Level</span>
                <span className="text-muted-foreground">
                  {options.svgSettings.turdsize}
                </span>
              </div>
              <Slider
                value={[options.svgSettings.turdsize]}
                min={0}
                max={100}
                step={1}
                onValueChange={(v) => updateSvg({ turdsize: sv(v) })}
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Corner Smoothing</span>
                <span className="text-muted-foreground">
                  {options.svgSettings.alphamax}
                </span>
              </div>
              <Slider
                value={[options.svgSettings.alphamax]}
                min={0}
                max={2}
                step={0.1}
                onValueChange={(v) => updateSvg({ alphamax: sv(v) })}
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Curve Precision</span>
                <span className="text-muted-foreground">
                  {options.svgSettings.opttolerance}
                </span>
              </div>
              <Slider
                value={[options.svgSettings.opttolerance]}
                min={0}
                max={1}
                step={0.05}
                onValueChange={(v) => updateSvg({ opttolerance: sv(v) })}
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Scale</span>
                <span className="text-muted-foreground">
                  {options.svgSettings.scale}
                </span>
              </div>
              <Slider
                value={[options.svgSettings.scale]}
                min={0.1}
                max={10}
                step={0.1}
                onValueChange={(v) => updateSvg({ scale: sv(v) })}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Long Curve Optimization</span>
              <Switch
                checked={options.svgSettings.longcurve}
                onCheckedChange={(v) => updateSvg({ longcurve: v })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {options.outputType === "colorSVG" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Color SVG Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Presets</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_SVG_PRESETS.map((preset) => {
                  const active = colorMatchesPreset(preset.settings)
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyColorPreset(preset.settings)}
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
                  value={options.colorSVGSettings.colormode}
                  onValueChange={(v) =>
                    updateColor({ colormode: v as "color" | "binary" })
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
                  value={options.colorSVGSettings.hierarchical}
                  onValueChange={(v) =>
                    updateColor({ hierarchical: v as "stacked" | "cutout" })
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
                  value={options.colorSVGSettings.mode}
                  onValueChange={(v) =>
                    updateColor({
                      mode: v as "spline" | "polygon" | "none",
                    })
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
                <span className="text-muted-foreground">
                  {options.colorSVGSettings.filter_speckle}
                </span>
              </div>
              <Slider
                value={[options.colorSVGSettings.filter_speckle]}
                min={0}
                max={100}
                step={1}
                onValueChange={(v) => updateColor({ filter_speckle: sv(v) })}
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Color Precision (bits)</span>
                <span className="text-muted-foreground">
                  {options.colorSVGSettings.color_precision}
                </span>
              </div>
              <Slider
                value={[options.colorSVGSettings.color_precision]}
                min={1}
                max={8}
                step={1}
                onValueChange={(v) => updateColor({ color_precision: sv(v) })}
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Layer Difference</span>
                <span className="text-muted-foreground">
                  {options.colorSVGSettings.layer_difference}
                </span>
              </div>
              <Slider
                value={[options.colorSVGSettings.layer_difference]}
                min={0}
                max={256}
                step={1}
                onValueChange={(v) => updateColor({ layer_difference: sv(v) })}
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Corner Threshold (°)</span>
                <span className="text-muted-foreground">
                  {options.colorSVGSettings.corner_threshold}
                </span>
              </div>
              <Slider
                value={[options.colorSVGSettings.corner_threshold]}
                min={0}
                max={180}
                step={1}
                onValueChange={(v) => updateColor({ corner_threshold: sv(v) })}
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Length Threshold</span>
                <span className="text-muted-foreground">
                  {options.colorSVGSettings.length_threshold.toFixed(1)}
                </span>
              </div>
              <Slider
                value={[options.colorSVGSettings.length_threshold]}
                min={3.5}
                max={10}
                step={0.1}
                onValueChange={(v) => updateColor({ length_threshold: sv(v) })}
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Splice Threshold (°)</span>
                <span className="text-muted-foreground">
                  {options.colorSVGSettings.splice_threshold}
                </span>
              </div>
              <Slider
                value={[options.colorSVGSettings.splice_threshold]}
                min={0}
                max={180}
                step={1}
                onValueChange={(v) => updateColor({ splice_threshold: sv(v) })}
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Path Precision</span>
                <span className="text-muted-foreground">
                  {options.colorSVGSettings.path_precision}
                </span>
              </div>
              <Slider
                value={[options.colorSVGSettings.path_precision]}
                min={1}
                max={16}
                step={1}
                onValueChange={(v) => updateColor({ path_precision: sv(v) })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!options.outputType}>
          {options.outputType ? "Start Processing" : "Select an output type"}
        </Button>
      </div>
    </div>
  )
}
