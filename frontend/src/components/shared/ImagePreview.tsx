interface ImagePreviewProps {
  src: string
  alt?: string
  className?: string
}

export function ImagePreview({ src, alt = "Preview", className = "" }: ImagePreviewProps) {
  return (
    <div className={`rounded-lg border bg-muted/50 overflow-hidden flex items-center justify-center ${className}`}>
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-full object-contain"
      />
    </div>
  )
}
