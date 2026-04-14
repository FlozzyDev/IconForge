import { useState } from "react"
import type { WizardState, ImageInfo, ProcessingOptions, ProcessingResults } from "@/types"

const DEFAULT_OPTIONS: ProcessingOptions = {
  removeBackground: true,
  silhouette: false,
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
    setState((prev) => ({ ...prev, croppedImage: image }))
  }

  function setOptions(options: ProcessingOptions) {
    setState((prev) => ({ ...prev, options }))
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
    setResults,
    reset,
  }
}
