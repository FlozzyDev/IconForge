export interface ImageInfo {
  filename: string
  width?: number
  height?: number
  size?: number
}

export interface CropData {
  x: number
  y: number
  width: number
  height: number
}

/** Server-side image directories: the input folder plus one folder per output type. */
export type Directory =
  | "input"
  | "background_removed"
  | "silhouette"
  | "color_svg"
  | "webp"

/** Top-level UI services. */
export type ServiceId =
  | "background"
  | "silhouette"
  | "colorSvg"
  | "webp"
  | "outputs"

export type ColorEngine = "fast" | "precision"

export interface BackgroundSettings {
  modelType: "rembg" | "inspyrenet"
  modelName: string
  mode: "base" | "fast"
}

export interface SilhouetteSettings {
  threshold: number
  turdsize: number
  alphamax: number
  opttolerance: number
  longcurve: boolean
  scale: number
}

export interface ColorSVGSettings {
  colormode: "color" | "binary"
  hierarchical: "stacked" | "cutout"
  mode: "spline" | "polygon" | "none"
  filter_speckle: number
  color_precision: number
  layer_difference: number
  corner_threshold: number
  length_threshold: number
  splice_threshold: number
  path_precision: number
}

export interface PotraceColorSettings {
  n_colors: number
  upscale_factor: 1 | 2 | 3 | 4
  smoothing: "none" | "bilateral" | "mean_shift"
  smooth_spatial_radius: number
  smooth_color_radius: number
  alpha_threshold: number
  min_region_pixels: number
  merge_color_distance: number
  mask_cleanup: boolean
  turdsize: number
  alphamax: number
  opttolerance: number
  longcurve: boolean
}

/** All engine settings, shared across service pages so tuning survives tab switches. */
export interface AppSettings {
  webpQuality: number
  colorEngine: ColorEngine
  bgSettings: BackgroundSettings
  svgSettings: SilhouetteSettings
  colorSVGSettings: ColorSVGSettings
  potraceColorSettings: PotraceColorSettings
}

/** An image selected as a processing source, tagged with the directory it lives in. */
export interface SourceRef {
  directory: Directory
  info: ImageInfo
}

export type RunStatus = "pending" | "processing" | "done" | "error"

export interface RunItem {
  source: SourceRef
  status: RunStatus
  result?: ImageInfo
  error?: string
}
