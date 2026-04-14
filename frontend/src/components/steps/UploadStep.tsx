import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropZone } from "@/components/shared/DropZone"
import { ImageCropper } from "@/components/shared/ImageCropper"
import type { ImageInfo, CropData } from "@/types"
import * as api from "@/services/api"

interface UploadStepProps {
  onComplete: (original: ImageInfo, cropped: ImageInfo) => void
}

export function UploadStep({ onComplete }: UploadStepProps) {
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState<ImageInfo | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFileSelected(file: File) {
    setError(null)
    setUploading(true)
    try {
      const result = await api.uploadImage(file)
      setUploaded(result)
      setPreviewUrl(api.getImageUrl("input", result.filename))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  async function handleCropConfirm(cropArea: CropData) {
    if (!uploaded) return
    setError(null)
    try {
      const cropped = await api.cropImage(
        uploaded.filename,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height
      )
      onComplete(uploaded, cropped)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Crop failed")
    }
  }

  function handleCancel() {
    setUploaded(null)
    setPreviewUrl(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {uploaded ? "Crop Your Image" : "Upload an Image"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            {error}
          </div>
        )}

        {uploading && (
          <div className="text-center py-12 text-muted-foreground">
            Uploading...
          </div>
        )}

        {!uploaded && !uploading && (
          <DropZone onFileSelected={handleFileSelected} />
        )}

        {uploaded && previewUrl && (
          <ImageCropper
            imageSrc={previewUrl}
            imageWidth={uploaded.width}
            imageHeight={uploaded.height}
            onCropConfirm={handleCropConfirm}
            onCancel={handleCancel}
          />
        )}
      </CardContent>
    </Card>
  )
}
