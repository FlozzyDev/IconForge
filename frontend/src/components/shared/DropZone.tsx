import { useDropzone } from "react-dropzone"
import { useCallback } from "react"

interface DropZoneProps {
  onFileSelected: (file: File) => void
}

export function DropZone({ onFileSelected }: DropZoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) {
        onFileSelected(accepted[0])
      }
    },
    [onFileSelected]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".bmp"] },
    maxFiles: 1,
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
        ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        <svg
          className="w-12 h-12 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 16v-8m0 0l-3 3m3-3l3 3M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M21 12l-3-9H6L3 12"
          />
        </svg>
        {isDragActive ? (
          <p className="text-primary font-medium">Drop your image here</p>
        ) : (
          <>
            <p className="font-medium">Drag & drop an image, or click to browse</p>
            <p className="text-sm text-muted-foreground">
              PNG, JPG, WebP, or BMP
            </p>
          </>
        )}
      </div>
    </div>
  )
}
