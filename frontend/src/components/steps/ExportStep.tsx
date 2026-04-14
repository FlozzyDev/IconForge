import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { ImagePreview } from "@/components/shared/ImagePreview"
import type { ProcessingResults } from "@/types"
import * as api from "@/services/api"

interface ExportStepProps {
  results: ProcessingResults
  onStartOver: () => void
}

export function ExportStep({ results, onStartOver }: ExportStepProps) {
  const [quality, setQuality] = useState(90)
  const [exporting, setExporting] = useState(false)

  async function downloadWebp(filename: string) {
    setExporting(true)
    try {
      const blob = await api.exportWebp(filename, quality)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename.replace(/\.[^.]+$/, ".webp")
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Export failed:", err)
    } finally {
      setExporting(false)
    }
  }

  function downloadSvg(filename: string) {
    const url = api.getImageUrl("output", filename)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="space-y-6">
      {/* WebP export for background-removed image */}
      {results.backgroundRemoved && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Background Removed
              <Badge>WebP</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImagePreview
              src={api.getImageUrl("output", results.backgroundRemoved.filename)}
              className="h-[250px]"
            />

            <div className="flex items-center gap-4">
              <span className="text-sm whitespace-nowrap">Quality: {quality}</span>
              <Slider
                value={[quality]}
                min={1}
                max={100}
                step={1}
                onValueChange={(v) => setQuality(Array.isArray(v) ? v[0] : v)}
                className="flex-1"
              />
            </div>

            <Button
              onClick={() => downloadWebp(results.backgroundRemoved!.filename)}
              disabled={exporting}
              className="w-full"
            >
              {exporting ? "Exporting..." : "Download as WebP"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* SVG export for silhouette */}
      {results.silhouette && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Silhouette
              <Badge variant="secondary">SVG</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImagePreview
              src={api.getImageUrl("output", results.silhouette.filename)}
              className="h-[250px]"
            />
            <Button
              onClick={() => downloadSvg(results.silhouette!.filename)}
              variant="outline"
              className="w-full"
            >
              Download SVG
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        <Button variant="ghost" onClick={onStartOver}>
          Process Another Image
        </Button>
      </div>
    </div>
  )
}
