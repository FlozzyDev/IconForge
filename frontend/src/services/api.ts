import type {
  ColorSVGSettings,
  Directory,
  ImageInfo,
  PotraceColorSettings,
  SilhouetteSettings,
} from "@/types"

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

// Crop (input folder only; writes <stem>_cropped.png back to the input folder)
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

// Silhouette SVG conversion
export async function convertToSvg(
  image: string,
  settings?: SilhouetteSettings
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
  settings?: ColorSVGSettings
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

// Color SVG (precision / potrace) conversion
export async function convertPotraceColor(
  image: string,
  settings?: PotraceColorSettings
): Promise<{ filename: string }> {
  return request("/potrace-color/convert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image, settings }),
  })
}

export async function checkPotraceColor(): Promise<{ available: boolean }> {
  return request("/potrace-color/check")
}

// WebP conversion — writes into output/webp/ and returns the file info
export async function exportWebp(
  image: string,
  quality: number = 90
): Promise<ImageInfo> {
  return request("/export/webp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image, quality }),
  })
}

// ZIP download of already-converted files in output/webp/
export async function exportZip(images: string[]): Promise<Blob> {
  const res = await fetch(`${BASE}/export/zip`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ images }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || "ZIP export failed")
  }
  return res.blob()
}

// Images
export async function listImages(directory: Directory): Promise<ImageInfo[]> {
  return request(`/images/${directory}`)
}

export async function deleteImage(
  directory: Directory,
  filename: string
): Promise<{ deleted: string }> {
  return request(`/images/${directory}/${encodeURIComponent(filename)}`, {
    method: "DELETE",
  })
}

export function getImageUrl(directory: Directory, filename: string): string {
  return `${BASE}/images/${directory}/${encodeURIComponent(filename)}`
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

export async function getPotraceColorSettings(): Promise<Record<string, unknown>> {
  return request("/settings/potrace-color")
}

export async function updatePotraceColorSettings(
  updates: Record<string, unknown>
): Promise<Record<string, unknown>> {
  return request("/settings/potrace-color", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  })
}
