/**
 * Snap a value to the nearest multiple of a grid size.
 */
export function snapToGrid(value: number, gridSize: number = 8): number {
  return Math.round(value / gridSize) * gridSize
}

/**
 * Ensure dimensions are divisible by 8, rounding down.
 */
export function snapDimensions(
  width: number,
  height: number
): { width: number; height: number } {
  return {
    width: Math.floor(width / 8) * 8,
    height: Math.floor(height / 8) * 8,
  }
}

/**
 * Get image dimensions from a File object.
 */
export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(img.src)
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Format file size for display.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
