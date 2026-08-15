import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Crop, RefreshCw, Trash2 } from "lucide-react"
import { DropZone } from "@/components/shared/DropZone"
import { ImageCropper } from "@/components/shared/ImageCropper"
import type { CropData, Directory, ImageInfo, SourceRef } from "@/types"
import * as api from "@/services/api"
import { formatFileSize } from "@/utils/imageUtils"

export function sourceKey(directory: Directory, filename: string): string {
  return `${directory}:${filename}`
}

interface ImagePickerProps {
  directories: { id: Directory; label: string }[]
  selected: Map<string, SourceRef>
  onSelectionChange: (selected: Map<string, SourceRef>) => void
  disabled?: boolean
}

export function ImagePicker({
  directories,
  selected,
  onSelectionChange,
  disabled,
}: ImagePickerProps) {
  const [activeDir, setActiveDir] = useState<Directory>(directories[0].id)
  const [imagesByDir, setImagesByDir] = useState<
    Partial<Record<Directory, ImageInfo[]>>
  >({})
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cropTarget, setCropTarget] = useState<ImageInfo | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const entries = await Promise.all(
        directories.map(async ({ id }) => {
          const imgs = await api.listImages(id)
          // Services process raster images only.
          return [
            id,
            imgs.filter(
              (i) => !i.filename.toLowerCase().endsWith(".svg")
            ),
          ] as const
        })
      )
      const byDir = Object.fromEntries(entries) as Partial<
        Record<Directory, ImageInfo[]>
      >
      setImagesByDir(byDir)
      // Drop selections whose files no longer exist.
      const next = new Map(
        [...selected].filter(([, ref]) =>
          (byDir[ref.directory] ?? []).some(
            (i) => i.filename === ref.info.filename
          )
        )
      )
      if (next.size !== selected.size) onSelectionChange(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to list images")
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [directories, selected])

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const images = imagesByDir[activeDir] ?? []

  function toggle(info: ImageInfo) {
    const key = sourceKey(activeDir, info.filename)
    const next = new Map(selected)
    if (next.has(key)) {
      next.delete(key)
    } else {
      next.set(key, { directory: activeDir, info })
    }
    onSelectionChange(next)
  }

  function selectAllInDir() {
    const next = new Map(selected)
    for (const info of images) {
      next.set(sourceKey(activeDir, info.filename), {
        directory: activeDir,
        info,
      })
    }
    onSelectionChange(next)
  }

  async function handleDelete(info: ImageInfo) {
    if (!window.confirm(`Delete ${info.filename}? This cannot be undone.`)) {
      return
    }
    setError(null)
    try {
      await api.deleteImage(activeDir, info.filename)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed")
    }
  }

  async function handleUpload(files: File[]) {
    setUploading(true)
    setError(null)
    try {
      for (const file of files) {
        await api.uploadImage(file)
      }
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  async function handleCropConfirm(crop: CropData) {
    if (!cropTarget) return
    setError(null)
    try {
      await api.cropImage(
        cropTarget.filename,
        crop.x,
        crop.y,
        crop.width,
        crop.height
      )
      setCropTarget(null)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Crop failed")
    }
  }

  if (cropTarget && cropTarget.width && cropTarget.height) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium">
          Cropping <span className="font-mono">{cropTarget.filename}</span> — the
          cropped copy is saved as a new file in the input folder.
        </p>
        <ImageCropper
          imageSrc={api.getImageUrl("input", cropTarget.filename)}
          imageWidth={cropTarget.width}
          imageHeight={cropTarget.height}
          onCropConfirm={handleCropConfirm}
          onCancel={() => setCropTarget(null)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {directories.length > 1 ? (
          <div className="inline-flex rounded-lg border p-1 gap-1">
            {directories.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveDir(id)}
                className={`
                  px-3 py-1 text-sm rounded-md transition-colors
                  ${
                    activeDir === id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                {label} ({(imagesByDir[id] ?? []).length})
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground font-mono">
            {directories[0].id === "input"
              ? "assets/input_images"
              : `output/${directories[0].id}`}
          </p>
        )}

        <div className="flex items-center gap-1">
          {images.length > 0 && (
            <Button variant="ghost" size="sm" onClick={selectAllInDir}>
              Select All
            </Button>
          )}
          {selected.size > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectionChange(new Map())}
            >
              Clear ({selected.size})
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void refresh()}
            disabled={loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          {error}
        </div>
      )}

      {activeDir === "input" && (
        <DropZone
          onFilesSelected={(files) => void handleUpload(files)}
          className="w-52 sm:w-60 aspect-[3/4] mx-auto"
        />
      )}
      {uploading && (
        <p className="text-sm text-center text-muted-foreground">Uploading...</p>
      )}

      {loading && images.length === 0 && activeDir !== "input" && (
        <div className="py-10 text-center text-sm text-muted-foreground">
          Loading images...
        </div>
      )}

      {!loading && images.length === 0 && activeDir !== "input" && (
        <div className="py-10 text-center text-sm text-muted-foreground">
          Nothing in output/{activeDir} yet.
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {images.map((img) => {
            const isSelected = selected.has(sourceKey(activeDir, img.filename))
            return (
              <div
                key={img.filename}
                className={`
                  relative rounded-lg border-2 p-2 transition-all
                  ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }
                `}
              >
                {isSelected && (
                  <span className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center pointer-events-none">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => toggle(img)}
                  className="block w-full text-left cursor-pointer disabled:cursor-not-allowed"
                >
                  <div className="h-24 rounded bg-checker flex items-center justify-center overflow-hidden mb-2">
                    <img
                      src={api.getImageUrl(activeDir, img.filename)}
                      alt={img.filename}
                      loading="lazy"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <p
                    className="text-xs font-medium truncate"
                    title={img.filename}
                  >
                    {img.filename}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {img.width && img.height
                      ? `${img.width}×${img.height}`
                      : ""}
                    {img.size ? ` · ${formatFileSize(img.size)}` : ""}
                  </p>
                </button>
                <div className="flex items-center justify-end gap-0.5 mt-1">
                  {activeDir === "input" && img.width && img.height && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      title="Crop (saves a copy)"
                      disabled={disabled}
                      onClick={() => setCropTarget(img)}
                    >
                      <Crop className="w-3 h-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    title="Delete"
                    disabled={disabled}
                    onClick={() => void handleDelete(img)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!loading && images.length === 0 && activeDir === "input" && (
        <p className="text-xs text-muted-foreground">
          You can also drop files directly into{" "}
          <span className="font-mono">assets/input_images</span> and hit Refresh.
        </p>
      )}
    </div>
  )
}
