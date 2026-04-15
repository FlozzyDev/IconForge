import type { ImageInfo } from "@/types"

const BASE = "/api"

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, options)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || "Request failed")
  }
  return res.json()
}

// Upload
export async function uploadImage(file: File): Promise<ImageInfo> {
  const form = new FormData()
  form.append("file", file)
  return request("/upload", { method: "POST", body: form })
}

// Crop
export async function cropImage(
  filename: string,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<ImageInfo> {
  return request("/crop", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, x, y, width, height }),
  })
}

// Background removal
export async function getModels(): Promise<{
  rembg: string[]
  inspyrenet: string[]
}> {
  return request("/background/models")
}

export async function processBackground(
  image: string,
  modelType: string,
  modelName: string,
  mode: string = "base"
): Promise<ImageInfo> {
  return request("/background/process", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image,
      model_type: modelType,
      model_name: modelName,
      mode,
    }),
  })
}

// SVG conversion
export async function convertToSvg(
  image: string,
  settings?: Record<string, unknown>
): Promise<{ filename: string }> {
  return request("/svg/convert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image, settings }),
  })
}

export async function checkPotrace(): Promise<{ available: boolean }> {
  return request("/svg/check-potrace")
}

// Color SVG (vtracer) conversion
export async function convertColorSVG(
  image: string,
  settings?: Record<string, unknown>
): Promise<{ filename: string }> {
  return request("/color-svg/convert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image, settings }),
  })
}

export async function checkVtracer(): Promise<{ available: boolean }> {
  return request("/color-svg/check-vtracer")
}

export async function getColorSVGSettings(): Promise<Record<string, unknown>> {
  return request("/settings/color-svg")
}

export async function updateColorSVGSettings(
  updates: Record<string, unknown>
): Promise<Record<string, unknown>> {
  return request("/settings/color-svg", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  })
}

// Export
export async function exportWebp(
  image: string,
  quality: number = 90
): Promise<Blob> {
  const res = await fetch(`${BASE}/export/webp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image, quality }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || "Export failed")
  }
  return res.blob()
}

// Images
export async function listInputImages(): Promise<ImageInfo[]> {
  return request("/images/input")
}

export async function listOutputImages(): Promise<ImageInfo[]> {
  return request("/images/output")
}

export function getImageUrl(directory: string, filename: string): string {
  return `${BASE}/images/${directory}/${filename}`
}

// Settings
export async function getSvgSettings(): Promise<Record<string, unknown>> {
  return request("/settings/svg")
}

export async function updateSvgSettings(
  updates: Record<string, unknown>
): Promise<Record<string, unknown>> {
  return request("/settings/svg", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  })
}
