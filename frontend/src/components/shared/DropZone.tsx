import { useDropzone } from "react-dropzone"
import { useCallback } from "react"
import { Upload } from "lucide-react"

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void
  className?: string
}

export function DropZone({ onFilesSelected, className = "" }: DropZoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) {
        onFilesSelected(accepted)
      }
    },
    [onFilesSelected]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".bmp"] },
  })

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg cursor-pointer transition-colors
        flex flex-col items-center justify-center gap-2 p-3 text-center
        ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
        ${className}
      `}
    >
      <input {...getInputProps()} />
      <Upload
        className={`w-8 h-8 ${isDragActive ? "text-primary" : "text-muted-foreground"}`}
      />
      {isDragActive ? (
        <p className="text-primary font-medium text-sm">Drop images here</p>
      ) : (
        <>
          <p className="font-medium text-sm">Drag & drop or click</p>
          <p className="text-xs text-muted-foreground">PNG, JPG, WebP, BMP</p>
        </>
      )}
    </div>
  )
}
