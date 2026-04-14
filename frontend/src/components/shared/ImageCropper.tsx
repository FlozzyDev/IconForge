import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { CropData } from "@/types"

interface ImageCropperProps {
  imageSrc: string
  imageWidth: number
  imageHeight: number
  onCropConfirm: (crop: CropData) => void
  onCancel: () => void
}

type Edge = "top" | "right" | "bottom" | "left"

const GRID = 8
const MIN = 8

function snap(v: number): number {
  return Math.round(v / GRID) * GRID
}

export function ImageCropper({
  imageSrc,
  imageWidth,
  imageHeight,
  onCropConfirm,
  onCancel,
}: ImageCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [crop, setCrop] = useState<CropData>({
    x: 0,
    y: 0,
    width: imageWidth,
    height: imageHeight,
  })

  useEffect(() => {
    setCrop({ x: 0, y: 0, width: imageWidth, height: imageHeight })
  }, [imageWidth, imageHeight])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      const s = Math.min(
        el.clientWidth / imageWidth,
        el.clientHeight / imageHeight,
        1
      )
      setScale(s > 0 ? s : 1)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [imageWidth, imageHeight])

  const dragRef = useRef<{
    edge: Edge
    startPointer: number
    startCrop: CropData
  } | null>(null)

  const onPointerDown = useCallback(
    (edge: Edge, e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      dragRef.current = {
        edge,
        startPointer: edge === "top" || edge === "bottom" ? e.clientY : e.clientX,
        startCrop: crop,
      }
    },
    [crop]
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const d = dragRef.current
      if (!d) return
      const pointer = d.edge === "top" || d.edge === "bottom" ? e.clientY : e.clientX
      const deltaImage = (pointer - d.startPointer) / scale
      const s = d.startCrop

      let next = { ...s }
      if (d.edge === "left") {
        const maxX = s.x + s.width - MIN
        const newX = Math.max(0, Math.min(maxX, snap(s.x + deltaImage)))
        next.x = newX
        next.width = s.x + s.width - newX
      } else if (d.edge === "right") {
        const minR = s.x + MIN
        const newR = Math.max(minR, Math.min(imageWidth, snap(s.x + s.width + deltaImage)))
        next.width = newR - s.x
      } else if (d.edge === "top") {
        const maxY = s.y + s.height - MIN
        const newY = Math.max(0, Math.min(maxY, snap(s.y + deltaImage)))
        next.y = newY
        next.height = s.y + s.height - newY
      } else {
        const minB = s.y + MIN
        const newB = Math.max(minB, Math.min(imageHeight, snap(s.y + s.height + deltaImage)))
        next.height = newB - s.y
      }
      setCrop(next)
    },
    [scale, imageWidth, imageHeight]
  )

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = null
    const t = e.currentTarget as HTMLElement
    if (t.hasPointerCapture?.(e.pointerId)) t.releasePointerCapture(e.pointerId)
  }, [])

  const displayW = imageWidth * scale
  const displayH = imageHeight * scale
  const cx = crop.x * scale
  const cy = crop.y * scale
  const cw = crop.width * scale
  const ch = crop.height * scale

  const mask = "rgba(0,0,0,0.5)"
  const handleHit = 14
  const handleBar = 2

  const edgeProps = (edge: Edge) => ({
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => onPointerDown(edge, e),
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
  })

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={containerRef}
        className="relative h-[500px] w-full bg-muted rounded-lg overflow-hidden flex items-center justify-center select-none"
      >
        <div
          style={{
            position: "relative",
            width: displayW,
            height: displayH,
            touchAction: "none",
          }}
        >
          <img
            src={imageSrc}
            draggable={false}
            style={{
              width: displayW,
              height: displayH,
              display: "block",
              userSelect: "none",
              pointerEvents: "none",
            }}
          />

          {/* Mask: four rectangles around the crop */}
          <div style={{ position: "absolute", left: 0, top: 0, width: displayW, height: cy, background: mask, pointerEvents: "none" }} />
          <div style={{ position: "absolute", left: 0, top: cy, width: cx, height: ch, background: mask, pointerEvents: "none" }} />
          <div style={{ position: "absolute", left: cx + cw, top: cy, width: displayW - (cx + cw), height: ch, background: mask, pointerEvents: "none" }} />
          <div style={{ position: "absolute", left: 0, top: cy + ch, width: displayW, height: displayH - (cy + ch), background: mask, pointerEvents: "none" }} />

          {/* Crop border */}
          <div
            style={{
              position: "absolute",
              left: cx,
              top: cy,
              width: cw,
              height: ch,
              outline: "1px solid white",
              pointerEvents: "none",
            }}
          />

          {/* Edge handles — visible bar + larger invisible hit area */}
          {/* Top */}
          <div
            {...edgeProps("top")}
            style={{
              position: "absolute",
              left: cx,
              top: cy - handleHit / 2,
              width: cw,
              height: handleHit,
              cursor: "ns-resize",
            }}
          >
            <div style={{ position: "absolute", left: 0, top: (handleHit - handleBar) / 2, width: "100%", height: handleBar, background: "white" }} />
          </div>
          {/* Bottom */}
          <div
            {...edgeProps("bottom")}
            style={{
              position: "absolute",
              left: cx,
              top: cy + ch - handleHit / 2,
              width: cw,
              height: handleHit,
              cursor: "ns-resize",
            }}
          >
            <div style={{ position: "absolute", left: 0, top: (handleHit - handleBar) / 2, width: "100%", height: handleBar, background: "white" }} />
          </div>
          {/* Left */}
          <div
            {...edgeProps("left")}
            style={{
              position: "absolute",
              left: cx - handleHit / 2,
              top: cy,
              width: handleHit,
              height: ch,
              cursor: "ew-resize",
            }}
          >
            <div style={{ position: "absolute", top: 0, left: (handleHit - handleBar) / 2, height: "100%", width: handleBar, background: "white" }} />
          </div>
          {/* Right */}
          <div
            {...edgeProps("right")}
            style={{
              position: "absolute",
              left: cx + cw - handleHit / 2,
              top: cy,
              width: handleHit,
              height: ch,
              cursor: "ew-resize",
            }}
          >
            <div style={{ position: "absolute", top: 0, left: (handleHit - handleBar) / 2, height: "100%", width: handleBar, background: "white" }} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <Badge variant="secondary" className="font-mono">
          {crop.width} × {crop.height}
        </Badge>
        <p className="text-xs text-muted-foreground">
          Drag any edge to crop. Snaps to 8px.
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onCropConfirm(crop)}>Confirm Crop</Button>
      </div>
    </div>
  )
}
