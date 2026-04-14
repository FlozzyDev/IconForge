import { useState, useEffect } from "react"
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
import { ImagePreview } from "@/components/shared/ImagePreview"
import { SettingsPanel } from "@/components/shared/SettingsPanel"
import type { ImageInfo, ProcessingOptions } from "@/types"
import * as api from "@/services/api"

interface OptionsStepProps {
  croppedImage: ImageInfo
  options: ProcessingOptions
  onOptionsChange: (options: ProcessingOptions) => void
  onNext: () => void
}

export function OptionsStep({
  croppedImage,
  options,
  onOptionsChange,
  onNext,
}: OptionsStepProps) {
  const [rembgModels, setRembgModels] = useState<string[]>([])

  useEffect(() => {
    api.getModels().then((m) => setRembgModels(m.rembg)).catch(() => {})
  }, [])

  function update(partial: Partial<ProcessingOptions>) {
    onOptionsChange({ ...options, ...partial })
  }

  function updateBg(partial: Partial<ProcessingOptions["bgSettings"]>) {
    update({ bgSettings: { ...options.bgSettings, ...partial } })
  }

  function updateSvg(partial: Partial<ProcessingOptions["svgSettings"]>) {
    update({ svgSettings: { ...options.svgSettings, ...partial } })
  }

  // Extract a single number from slider value (number | readonly number[])
  function sv(v: number | readonly number[]): number {
    return typeof v === "number" ? v : v[0] ?? 0
  }

  const previewUrl = api.getImageUrl("output", croppedImage.filename)
  const hasSelection = options.removeBackground || options.silhouette

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left: Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <ImagePreview src={previewUrl} className="h-[350px]" />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            {croppedImage.width} x {croppedImage.height}
          </p>
        </CardContent>
      </Card>

      {/* Right: Options */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Remove Background */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-medium">Remove Background</label>
              <Switch
                checked={options.removeBackground}
                onCheckedChange={(checked) => update({ removeBackground: checked })}
              />
            </div>

            {options.removeBackground && (
              <SettingsPanel title="Background Removal Settings">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm">Model Type</label>
                    <Select
                      value={options.bgSettings.modelType}
                      onValueChange={(v) => updateBg({ modelType: v as "rembg" | "inspyrenet" })}
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

                  {options.bgSettings.modelType === "rembg" && rembgModels.length > 0 && (
                    <div>
                      <label className="text-sm">Model</label>
                      <Select
                        value={options.bgSettings.modelName ?? undefined}
                        onValueChange={(v) => v && updateBg({ modelName: v })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {rembgModels.map((m) => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {options.bgSettings.modelType === "inspyrenet" && (
                    <div>
                      <label className="text-sm">Mode</label>
                      <Select
                        value={options.bgSettings.mode}
                        onValueChange={(v) => updateBg({ mode: v as "base" | "fast" })}
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
              </SettingsPanel>
            )}
          </div>

          {/* Silhouette */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-medium">Silhouette (SVG)</label>
              <Switch
                checked={options.silhouette}
                onCheckedChange={(checked) => update({ silhouette: checked })}
              />
            </div>

            {options.silhouette && (
              <SettingsPanel title="Silhouette Settings">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Threshold</span>
                      <span className="text-muted-foreground">{options.svgSettings.threshold}</span>
                    </div>
                    <Slider
                      value={[options.svgSettings.threshold]}
                      min={0} max={255} step={1}
                      onValueChange={(v) => updateSvg({ threshold: sv(v) })}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Detail Level</span>
                      <span className="text-muted-foreground">{options.svgSettings.turdsize}</span>
                    </div>
                    <Slider
                      value={[options.svgSettings.turdsize]}
                      min={0} max={100} step={1}
                      onValueChange={(v) => updateSvg({ turdsize: sv(v) })}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Corner Smoothing</span>
                      <span className="text-muted-foreground">{options.svgSettings.alphamax}</span>
                    </div>
                    <Slider
                      value={[options.svgSettings.alphamax]}
                      min={0} max={2} step={0.1}
                      onValueChange={(v) => updateSvg({ alphamax: sv(v) })}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Curve Precision</span>
                      <span className="text-muted-foreground">{options.svgSettings.opttolerance}</span>
                    </div>
                    <Slider
                      value={[options.svgSettings.opttolerance]}
                      min={0} max={1} step={0.05}
                      onValueChange={(v) => updateSvg({ opttolerance: sv(v) })}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Scale</span>
                      <span className="text-muted-foreground">{options.svgSettings.scale}</span>
                    </div>
                    <Slider
                      value={[options.svgSettings.scale]}
                      min={0.1} max={10} step={0.1}
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
                </div>
              </SettingsPanel>
            )}
          </div>

          {/* Next button */}
          <Button onClick={onNext} disabled={!hasSelection} className="w-full">
            {hasSelection ? "Start Processing" : "Select at least one option"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
