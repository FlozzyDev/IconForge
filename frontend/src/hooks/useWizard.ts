import { useState } from "react"
import type {
  WizardState,
  ImageInfo,
  ProcessingOptions,
  ProcessingResults,
} from "@/types"

const DEFAULT_OPTIONS: ProcessingOptions = {
  outputType: null,
  webpQuality: 90,
  bgSettings: {
    modelType: "rembg",
    modelName: "bria-rmbg",
    mode: "base",
  },
  svgSettings: {
    threshold: 128,
    turdsize: 2,
    alphamax: 1.0,
    opttolerance: 0.2,
    longcurve: true,
    scale: 1.0,
  },
  colorSVGSettings: {
    colormode: "color",
    hierarchical: "cutout",
    mode: "spline",
    filter_speckle: 4,
    color_precision: 6,
    layer_difference: 16,
    corner_threshold: 60,
    length_threshold: 4.0,
    splice_threshold: 45,
    path_precision: 8,
  },
}

export function useWizard() {
  const [state, setState] = useState<WizardState>({
    currentStep: 1,
    originalImage: null,
    croppedImage: null,
    options: DEFAULT_OPTIONS,
    results: {},
  })

  function goToStep(step: number) {
    setState((prev) => ({ ...prev, currentStep: step }))
  }

  function nextStep() {
    setState((prev) => ({ ...prev, currentStep: prev.currentStep + 1 }))
  }

  function prevStep() {
    setState((prev) => ({ ...prev, currentStep: prev.currentStep - 1 }))
  }

  function setOriginalImage(image: ImageInfo) {
    setState((prev) => ({ ...prev, originalImage: image }))
  }

  function setCroppedImage(image: ImageInfo) {
    setState((prev) => ({
      ...prev,
      croppedImage: image,
      results: {},
    }))
  }

  function setOptions(options: ProcessingOptions) {
    setState((prev) => ({ ...prev, options }))
  }

  function setBackgroundRemoved(image: ImageInfo) {
    setState((prev) => ({
      ...prev,
      results: { backgroundRemoved: image },
    }))
  }

  function setOutputFile(file: { filename: string; type: "webp" | "svg" }) {
    setState((prev) => ({
      ...prev,
      results: { ...prev.results, outputFile: file },
    }))
  }

  function setResults(results: ProcessingResults) {
    setState((prev) => ({ ...prev, results }))
  }

  function reset() {
    setState({
      currentStep: 1,
      originalImage: null,
      croppedImage: null,
      options: DEFAULT_OPTIONS,
      results: {},
    })
  }

  return {
    state,
    goToStep,
    nextStep,
    prevStep,
    setOriginalImage,
    setCroppedImage,
    setOptions,
    setBackgroundRemoved,
    setOutputFile,
    setResults,
    reset,
  }
}
