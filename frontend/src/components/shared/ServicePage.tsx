import { useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Download } from "lucide-react"
import { ImagePicker, sourceKey } from "@/components/shared/ImagePicker"
import type { Directory, ImageInfo, RunItem, SourceRef } from "@/types"
import * as api from "@/services/api"

interface ServicePageProps {
  title: string
  description: string
  /** Directories the user can pick sources from (first = default tab). */
  sourceDirs: { id: Directory; label: string }[]
  /** Where results land — used for previews and download links. */
  resultDirectory: Directory
  /** Label for the run button, e.g. "Remove Backgrounds". */
  runLabel: string
  /** Convert one source file; returns the produced file's info. */
  process: (filename: string) => Promise<ImageInfo | { filename: string }>
  /** null = probing, false = engine missing (run disabled). */
  available?: boolean | null
  unavailableReason?: string
  /** Settings card content (omitted if undefined). */
  settingsPanel?: React.ReactNode
  /** Extra actions rendered under the results, given the completed items. */
  resultActions?: (done: RunItem[]) => React.ReactNode
}

const STATUS_LABEL: Record<RunItem["status"], string> = {
  pending: "Pending",
  processing: "Processing...",
  done: "Done",
  error: "Failed",
}

export function ServicePage({
  title,
  description,
  sourceDirs,
  resultDirectory,
  runLabel,
  process,
  available,
  unavailableReason,
  settingsPanel,
  resultActions,
}: ServicePageProps) {
  const [selected, setSelected] = useState<Map<string, SourceRef>>(new Map())
  const [items, setItems] = useState<RunItem[]>([])
  const [running, setRunning] = useState(false)
  const stopRef = useRef(false)

  const doneItems = items.filter((i) => i.status === "done")
  const doneCount = doneItems.length
  const errorCount = items.filter((i) => i.status === "error").length

  function setItem(index: number, patch: Partial<RunItem>) {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, ...patch } : it))
    )
  }

  async function run(force: boolean) {
    const sources = [...selected.values()]
    if (sources.length === 0) return
    stopRef.current = false
    setRunning(true)

    // Keep completed results for sources still selected unless forcing a re-run.
    const prev = new Map(
      items.map((it) => [sourceKey(it.source.directory, it.source.info.filename), it])
    )
    const next: RunItem[] = sources.map((source) => {
      const key = sourceKey(source.directory, source.info.filename)
      const old = prev.get(key)
      if (!force && old?.status === "done") return old
      return { source, status: "pending" }
    })
    setItems(next)

    for (let i = 0; i < next.length; i++) {
      if (stopRef.current) break
      if (next[i].status === "done") continue
      setItem(i, { status: "processing", error: undefined })
      try {
        const result = await process(next[i].source.info.filename)
        next[i] = { ...next[i], status: "done", result }
        setItem(i, { status: "done", result })
      } catch (err) {
        next[i] = { ...next[i], status: "error" }
        setItem(i, {
          status: "error",
          error: err instanceof Error ? err.message : "Processing failed",
        })
      }
    }
    // Anything untouched when stopped stays pending.
    setRunning(false)
  }

  const selectionCount = selected.size
  const isUnavailable = available === false

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{description}</p>
          {isUnavailable && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              {unavailableReason ?? "This engine is not available on the backend."}
            </div>
          )}
          <ImagePicker
            directories={sourceDirs}
            selected={selected}
            onSelectionChange={setSelected}
            disabled={running}
          />
        </CardContent>
      </Card>

      {settingsPanel && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Settings</CardTitle>
          </CardHeader>
          <CardContent>{settingsPanel}</CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="space-y-4">
          {running && (
            <div className="space-y-2">
              <Progress
                value={items.length > 0 ? (doneCount / items.length) * 100 : 0}
              />
              <p className="text-sm text-center text-muted-foreground">
                Processing {Math.min(doneCount + errorCount + 1, items.length)} of{" "}
                {items.length}...
              </p>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {!running && (
              <Button
                onClick={() => void run(false)}
                disabled={selectionCount === 0 || isUnavailable}
              >
                {selectionCount === 0
                  ? "Select images above"
                  : errorCount > 0
                  ? `Retry Failed / ${runLabel} (${selectionCount})`
                  : `${runLabel} (${selectionCount})`}
              </Button>
            )}
            {!running && doneCount > 0 && (
              <Button variant="outline" onClick={() => void run(true)}>
                Re-run All with Current Settings
              </Button>
            )}
            {running && (
              <Button
                variant="destructive"
                onClick={() => {
                  stopRef.current = true
                }}
              >
                Stop After Current Image
              </Button>
            )}
            {items.length > 0 && !running && (
              <p className="text-sm text-muted-foreground ml-auto">
                {doneCount} done
                {errorCount > 0 ? `, ${errorCount} failed` : ""} · saved to{" "}
                <span className="font-mono">output/{resultDirectory}</span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {items.map((item) => (
                <div
                  key={sourceKey(item.source.directory, item.source.info.filename)}
                  className="rounded-lg border p-2 space-y-2"
                >
                  <div className="h-28 rounded bg-checker flex items-center justify-center overflow-hidden">
                    <img
                      src={
                        item.result
                          ? api.getImageUrl(resultDirectory, item.result.filename)
                          : api.getImageUrl(
                              item.source.directory,
                              item.source.info.filename
                            )
                      }
                      alt={item.source.info.filename}
                      loading="lazy"
                      className={`max-w-full max-h-full object-contain ${
                        item.status === "processing" ? "animate-pulse" : ""
                      }`}
                    />
                  </div>
                  <p
                    className="text-xs font-medium truncate"
                    title={item.result?.filename ?? item.source.info.filename}
                  >
                    {item.result?.filename ?? item.source.info.filename}
                  </p>
                  <div className="flex items-center justify-between gap-1">
                    <Badge
                      variant={
                        item.status === "done"
                          ? "default"
                          : item.status === "error"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {STATUS_LABEL[item.status]}
                    </Badge>
                    {item.status === "done" && item.result && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Download"
                        render={
                          <a
                            href={api.getImageUrl(
                              resultDirectory,
                              item.result.filename
                            )}
                            download={item.result.filename}
                          />
                        }
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                  {item.error && (
                    <p className="text-xs text-destructive" title={item.error}>
                      {item.error}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {resultActions && doneCount > 0 && resultActions(doneItems)}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
