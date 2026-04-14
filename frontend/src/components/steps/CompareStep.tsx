import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ImagePreview } from "@/components/shared/ImagePreview"
import type { ImageInfo, ProcessingResults } from "@/types"
import * as api from "@/services/api"

interface CompareStepProps {
  croppedImage: ImageInfo
  results: ProcessingResults
  onNext: () => void
}

export function CompareStep({ croppedImage, results, onNext }: CompareStepProps) {
  const originalUrl = api.getImageUrl("output", croppedImage.filename)

  return (
    <div className="space-y-6">
      {/* Background removal comparison */}
      {results.backgroundRemoved && (
        <Card>
          <CardHeader>
            <CardTitle>Background Removal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2 text-center">Original</p>
                <ImagePreview src={originalUrl} className="h-[300px]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2 text-center">Background Removed</p>
                <ImagePreview
                  src={api.getImageUrl("output", results.backgroundRemoved.filename)}
                  className="h-[300px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Silhouette result */}
      {results.silhouette && (
        <Card>
          <CardHeader>
            <CardTitle>Silhouette (SVG)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2 text-center">Source</p>
                <ImagePreview
                  src={
                    results.backgroundRemoved
                      ? api.getImageUrl("output", results.backgroundRemoved.filename)
                      : originalUrl
                  }
                  className="h-[300px]"
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2 text-center">Silhouette</p>
                <ImagePreview
                  src={api.getImageUrl("output", results.silhouette.filename)}
                  className="h-[300px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={onNext}>Continue to Export</Button>
      </div>
    </div>
  )
}
