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

export interface ProcessingOptions {
  removeBackground: boolean
  silhouette: boolean
  bgSettings: {
    modelType: "rembg" | "inspyrenet"
    modelName: string
    mode: "base" | "fast"
  }
  svgSettings: {
    threshold: number
    turdsize: number
    alphamax: number
    opttolerance: number
    longcurve: boolean
    scale: number
  }
}

export interface ProcessingResults {
  backgroundRemoved?: ImageInfo
  silhouette?: { filename: string }
}

export interface WizardState {
  currentStep: number
  originalImage: ImageInfo | null
  croppedImage: ImageInfo | null
  options: ProcessingOptions
  results: ProcessingResults
}
