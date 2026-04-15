import { WizardLayout } from "@/components/layout/WizardLayout"
import { UploadStep } from "@/components/steps/UploadStep"
import { BackgroundRemovalStep } from "@/components/steps/BackgroundRemovalStep"
import { OutputTypeStep } from "@/components/steps/OutputTypeStep"
import { ProcessingStep } from "@/components/steps/ProcessingStep"
import { ExportStep } from "@/components/steps/ExportStep"
import { useWizard } from "@/hooks/useWizard"
import type { ImageInfo, ProcessingOptions } from "@/types"

export default function App() {
  const {
    state,
    nextStep,
    prevStep,
    setOriginalImage,
    setCroppedImage,
    setOptions,
    setBackgroundRemoved,
    clearBackgroundRemoved,
    setOutputFile,
    goToStep,
    reset,
  } = useWizard()

  function handleUploadComplete(original: ImageInfo, cropped: ImageInfo) {
    setOriginalImage(original)
    setCroppedImage(cropped)
    nextStep()
  }

  function handleOptionsChange(options: ProcessingOptions) {
    setOptions(options)
  }

  function handleBgComplete(result: ImageInfo) {
    setBackgroundRemoved(result)
  }

  function handleBgSkip() {
    // Discard any previous BG-removed result and advance. The output-type and
    // processing steps will fall back to the cropped image as the source.
    clearBackgroundRemoved()
    // If the user had silhouette selected, clear it — it requires alpha.
    if (state.options.outputType === "silhouette") {
      setOptions({ ...state.options, outputType: null })
    }
    goToStep(3)
  }

  function handleProcessingComplete(file: {
    filename: string
    type: "webp" | "svg"
  }) {
    setOutputFile(file)
    nextStep()
  }

  function handleProcessingError(error: string) {
    console.error("Processing error:", error)
    prevStep()
  }

  // Source image for output/processing steps: BG-removed if available, else crop.
  const sourceImage = state.results.backgroundRemoved ?? state.croppedImage
  const hasBgRemoval = Boolean(state.results.backgroundRemoved)

  return (
    <WizardLayout
      currentStep={state.currentStep}
      onBack={
        state.currentStep > 1 && state.currentStep < 4 ? prevStep : undefined
      }
      onReset={state.currentStep > 1 ? reset : undefined}
    >
      {state.currentStep === 1 && (
        <UploadStep onComplete={handleUploadComplete} />
      )}

      {state.currentStep === 2 && state.croppedImage && (
        <BackgroundRemovalStep
          croppedImage={state.croppedImage}
          backgroundRemoved={state.results.backgroundRemoved}
          options={state.options}
          onOptionsChange={handleOptionsChange}
          onComplete={handleBgComplete}
          onSkip={handleBgSkip}
          onNext={() => goToStep(3)}
        />
      )}

      {state.currentStep === 3 && sourceImage && (
        <OutputTypeStep
          options={state.options}
          hasBgRemoval={hasBgRemoval}
          onOptionsChange={handleOptionsChange}
          onNext={() => goToStep(4)}
        />
      )}

      {state.currentStep === 4 && sourceImage && (
        <ProcessingStep
          sourceImage={sourceImage}
          options={state.options}
          onComplete={handleProcessingComplete}
          onError={handleProcessingError}
        />
      )}

      {state.currentStep === 5 && (
        <ExportStep
          results={state.results}
          options={state.options}
          onStartOver={reset}
        />
      )}
    </WizardLayout>
  )
}
