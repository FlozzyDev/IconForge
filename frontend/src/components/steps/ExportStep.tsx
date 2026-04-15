import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ImagePreview } from "@/components/shared/ImagePreview"
import type { ProcessingOptions, ProcessingResults } from "@/types"
import * as api from "@/services/api"

interface ExportStepProps {
  results: ProcessingResults
  options: ProcessingOptions
  onStartOver: () => void
}

export function ExportStep({ results, options, onStartOver }: ExportStepProps) {
  const [exporting, setExporting] = useState(false)
  const outputFile = results.outputFile

  async function downloadWebp(filename: string) {
    setExporting(true)
    try {
      const blob = await api.exportWebp(filename, options.webpQuality)
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

  if (!outputFile) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6 text-center text-muted-foreground">
          No output file available. Please restart the wizard.
        </CardContent>
      </Card>
    )
  }

  const previewUrl = api.getImageUrl("output", outputFile.filename)
  const isWebp = outputFile.type === "webp"

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isWebp ? "Background Removed" : "Vector Output"}
            <Badge variant={isWebp ? "default" : "secondary"}>
              {isWebp ? "WebP" : "SVG"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImagePreview src={previewUrl} className="h-[350px]" />

          {isWebp && (
            <p className="text-sm text-center text-muted-foreground">
              Quality: {options.webpQuality} (set in Output Type step)
            </p>
          )}

          <Button
            onClick={() =>
              isWebp
                ? downloadWebp(outputFile.filename)
                : downloadSvg(outputFile.filename)
            }
            disabled={exporting}
            className="w-full"
          >
            {exporting
              ? "Exporting..."
              : isWebp
              ? "Download as WebP"
              : "Download SVG"}
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button variant="ghost" onClick={onStartOver}>
          Process Another Image
        </Button>
      </div>
    </div>
  )
}
