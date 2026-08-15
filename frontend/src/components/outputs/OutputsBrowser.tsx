import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw, Trash2 } from "lucide-react"
import type { Directory, ImageInfo } from "@/types"
import * as api from "@/services/api"
import { formatFileSize } from "@/utils/imageUtils"

const OUTPUT_DIRS: { id: Directory; label: string }[] = [
  { id: "background_removed", label: "Background Removed" },
  { id: "silhouette", label: "Silhouette SVG" },
  { id: "color_svg", label: "Color SVG" },
  { id: "webp", label: "WebP" },
]

export function OutputsBrowser() {
  const [activeDir, setActiveDir] = useState<Directory>("background_removed")
  const [imagesByDir, setImagesByDir] = useState<
    Partial<Record<Directory, ImageInfo[]>>
  >({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const entries = await Promise.all(
        OUTPUT_DIRS.map(async ({ id }) => [id, await api.listImages(id)] as const)
      )
      setImagesByDir(
        Object.fromEntries(entries) as Partial<Record<Directory, ImageInfo[]>>
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to list outputs")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

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

  const images = imagesByDir[activeDir] ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Outputs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Everything produced by the services, organized under{" "}
          <span className="font-mono">output/</span> by type.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex rounded-lg border p-1 gap-1 flex-wrap">
            {OUTPUT_DIRS.map(({ id, label }) => (
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

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            {error}
          </div>
        )}

        {loading && images.length === 0 && (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        )}

        {!loading && images.length === 0 && (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Nothing in <span className="font-mono">output/{activeDir}</span> yet.
          </div>
        )}

        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {images.map((img) => (
              <div key={img.filename} className="rounded-lg border p-2 space-y-1">
                <div className="h-28 rounded bg-checker flex items-center justify-center overflow-hidden">
                  <img
                    src={api.getImageUrl(activeDir, img.filename)}
                    alt={img.filename}
                    loading="lazy"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <p className="text-xs font-medium truncate" title={img.filename}>
                  {img.filename}
                </p>
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs text-muted-foreground">
                    {img.width && img.height
                      ? `${img.width}×${img.height} · `
                      : ""}
                    {img.size ? formatFileSize(img.size) : ""}
                  </p>
                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      title="Download"
                      render={
                        <a
                          href={api.getImageUrl(activeDir, img.filename)}
                          download={img.filename}
                        />
                      }
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      title="Delete"
                      onClick={() => void handleDelete(img)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
