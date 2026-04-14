import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { ImageInfo, ProcessingOptions, ProcessingResults } from "@/types"
import * as api from "@/services/api"

interface ProcessingStepProps {
  croppedImage: ImageInfo
  options: ProcessingOptions
  onComplete: (results: ProcessingResults) => void
  onError: (error: string) => void
}

export function ProcessingStep({
  croppedImage,
  options,
  onComplete,
  onError,
}: ProcessingStepProps) {
  const [status, setStatus] = useState("Starting...")
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function run() {
      const results: ProcessingResults = {}
      const steps: string[] = []
      if (options.removeBackground) steps.push("bg")
      if (options.silhouette) steps.push("svg")
      const stepSize = 100 / steps.length

      try {
        let currentProgress = 0

        // Step 1: Background removal
        if (options.removeBackground && !cancelled) {
          setStatus("Removing background...")
          const bgResult = await api.processBackground(
            croppedImage.filename,
            options.bgSettings.modelType,
            options.bgSettings.modelName,
            options.bgSettings.mode
          )
          results.backgroundRemoved = bgResult
          currentProgress += stepSize
          setProgress(currentProgress)
        }

        // Step 2: Silhouette SVG (needs bg-removed image if available)
        if (options.silhouette && !cancelled) {
          setStatus("Creating silhouette...")
          const sourceImage = results.backgroundRemoved
            ? results.backgroundRemoved.filename
            : croppedImage.filename
          const svgResult = await api.convertToSvg(sourceImage, options.svgSettings)
          results.silhouette = svgResult
          currentProgress += stepSize
          setProgress(currentProgress)
        }

        if (!cancelled) {
          setStatus("Done!")
          setProgress(100)
          // Small delay so user sees 100%
          setTimeout(() => onComplete(results), 500)
        }
      } catch (err) {
        if (!cancelled) {
          onError(err instanceof Error ? err.message : "Processing failed")
        }
      }
    }

    run()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Processing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} />
        <p className="text-sm text-center text-muted-foreground">{status}</p>
      </CardContent>
    </Card>
  )
}
