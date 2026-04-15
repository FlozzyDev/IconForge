import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { ImageInfo, ProcessingOptions } from "@/types"
import * as api from "@/services/api"

interface ProcessingStepProps {
  sourceImage: ImageInfo
  options: ProcessingOptions
  onComplete: (file: { filename: string; type: "webp" | "svg" }) => void
  onError: (error: string) => void
}

export function ProcessingStep({
  sourceImage,
  options,
  onComplete,
  onError,
}: ProcessingStepProps) {
  const [status, setStatus] = useState("Starting...")
  const [progress, setProgress] = useState(10)

  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        if (options.outputType === "webp") {
          // WebP is produced on-demand by the Export step from the
          // background-removed PNG; nothing to do here beyond passing through.
          if (!cancelled) {
            setStatus("Ready to export")
            setProgress(100)
            setTimeout(
              () =>
                onComplete({
                  filename: sourceImage.filename,
                  type: "webp",
                }),
              400
            )
          }
          return
        }

        if (options.outputType === "silhouette") {
          setStatus("Creating silhouette SVG...")
          setProgress(40)
          const result = await api.convertToSvg(
            sourceImage.filename,
            options.svgSettings
          )
          if (!cancelled) {
            setStatus("Done")
            setProgress(100)
            setTimeout(
              () => onComplete({ filename: result.filename, type: "svg" }),
              400
            )
          }
          return
        }

        if (options.outputType === "colorSVG") {
          setStatus("Vectorizing with VTracer...")
          setProgress(40)
          const result = await api.convertColorSVG(
            sourceImage.filename,
            options.colorSVGSettings
          )
          if (!cancelled) {
            setStatus("Done")
            setProgress(100)
            setTimeout(
              () => onComplete({ filename: result.filename, type: "svg" }),
              400
            )
          }
          return
        }

        if (options.outputType === "colorPotrace") {
          setStatus(
            "Running AA-aware color vectorization... this may take up to a minute"
          )
          setProgress(30)
          const result = await api.convertPotraceColor(
            sourceImage.filename,
            options.potraceColorSettings
          )
          if (!cancelled) {
            setStatus("Done")
            setProgress(100)
            setTimeout(
              () => onComplete({ filename: result.filename, type: "svg" }),
              400
            )
          }
          return
        }

        if (!cancelled) {
          onError("No output type selected")
        }
      } catch (err) {
        if (!cancelled) {
          onError(err instanceof Error ? err.message : "Processing failed")
        }
      }
    }

    run()
    return () => {
      cancelled = true
    }
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
