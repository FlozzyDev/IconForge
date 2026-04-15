import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ImagePreview } from "@/components/shared/ImagePreview"
import type {
  BackgroundSettings,
  ImageInfo,
  ProcessingOptions,
} from "@/types"
import * as api from "@/services/api"

interface BackgroundRemovalStepProps {
  croppedImage: ImageInfo
  backgroundRemoved?: ImageInfo
  options: ProcessingOptions
  onOptionsChange: (options: ProcessingOptions) => void
  onComplete: (result: ImageInfo) => void
  onSkip: () => void
  onNext: () => void
}

export function BackgroundRemovalStep({
  croppedImage,
  backgroundRemoved,
  options,
  onOptionsChange,
  onComplete,
  onSkip,
  onNext,
}: BackgroundRemovalStepProps) {
  const [rembgModels, setRembgModels] = useState<string[]>([])
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.getModels().then((m) => setRembgModels(m.rembg)).catch(() => {})
  }, [])

  function updateBg(partial: Partial<BackgroundSettings>) {
    onOptionsChange({
      ...options,
      bgSettings: { ...options.bgSettings, ...partial },
    })
  }

  async function runRemoval() {
    setProcessing(true)
    setError(null)
    try {
      const result = await api.processBackground(
        croppedImage.filename,
        options.bgSettings.modelType,
        options.bgSettings.modelName,
        options.bgSettings.mode
      )
      onComplete(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Background removal failed")
    } finally {
      setProcessing(false)
    }
  }

  const originalUrl = api.getImageUrl("output", croppedImage.filename)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Background Removal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Model Type</label>
              <Select
                value={options.bgSettings.modelType}
                onValueChange={(v) =>
                  updateBg({ modelType: v as "rembg" | "inspyrenet" })
                }
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

            {options.bgSettings.modelType === "rembg" &&
              rembgModels.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Model</label>
                  <Select
                    value={options.bgSettings.modelName ?? undefined}
                    onValueChange={(v) => v && updateBg({ modelName: v })}
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

            {options.bgSettings.modelType === "inspyrenet" && (
              <div>
                <label className="text-sm font-medium">Mode</label>
                <Select
                  value={options.bgSettings.mode}
                  onValueChange={(v) =>
                    updateBg({ mode: v as "base" | "fast" })
                  }
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

          {processing && (
            <div className="space-y-2">
              <Progress value={undefined} />
              <p className="text-sm text-center text-muted-foreground">
                Removing background... this may take a moment
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Button
              onClick={runRemoval}
              disabled={processing}
              variant={backgroundRemoved ? "outline" : "default"}
            >
              {processing
                ? "Processing..."
                : backgroundRemoved
                ? "Re-run with Current Settings"
                : "Remove Background"}
            </Button>
            <Button
              onClick={onSkip}
              disabled={processing}
              variant="ghost"
            >
              {backgroundRemoved
                ? "Discard & Use Original"
                : "Skip (Keep Original Background)"}
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Skipping disables the Silhouette SVG output (it traces the alpha channel).
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Original</CardTitle>
          </CardHeader>
          <CardContent>
            <ImagePreview src={originalUrl} className="h-[300px]" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Background Removed</CardTitle>
          </CardHeader>
          <CardContent>
            {backgroundRemoved ? (
              <ImagePreview
                src={api.getImageUrl("output", backgroundRemoved.filename)}
                className="h-[300px]"
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-md text-sm text-muted-foreground">
                Click "Remove Background" to preview
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!backgroundRemoved || processing}>
          Continue to Output Type
        </Button>
      </div>
    </div>
  )
}

