export interface ImageInfo {
  filename: string
  width: number
  height: number
  size?: number
}

export interface CropData {
  x: number
  y: number
  width: number
  height: number
}

export type OutputType = "webp" | "silhouette" | "colorSVG" | "colorPotrace"

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
  turdsize: number
  alphamax: number
  opttolerance: number
  longcurve: boolean
}

export interface ProcessingOptions {
  outputType: OutputType | null
  webpQuality: number
  bgSettings: BackgroundSettings
  svgSettings: SilhouetteSettings
  colorSVGSettings: ColorSVGSettings
  potraceColorSettings: PotraceColorSettings
}

export interface ProcessingResults {
  backgroundRemoved?: ImageInfo
  outputFile?: { filename: string; type: "webp" | "svg" }
}

export interface WizardState {
  currentStep: number
  originalImage: ImageInfo | null
  croppedImage: ImageInfo | null
  options: ProcessingOptions
  results: ProcessingResults
}
