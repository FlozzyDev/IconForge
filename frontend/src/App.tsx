import { WizardLayout } from "@/components/layout/WizardLayout"
import { UploadStep } from "@/components/steps/UploadStep"
import { OptionsStep } from "@/components/steps/OptionsStep"
import { ProcessingStep } from "@/components/steps/ProcessingStep"
import { CompareStep } from "@/components/steps/CompareStep"
import { ExportStep } from "@/components/steps/ExportStep"
import { useWizard } from "@/hooks/useWizard"
import type { ImageInfo, ProcessingOptions, ProcessingResults } from "@/types"

export default function App() {
  const {
    state,
    nextStep,
    prevStep,
    setOriginalImage,
    setCroppedImage,
    setOptions,
    setResults,
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

  function handleProcessingComplete(results: ProcessingResults) {
    setResults(results)
    nextStep()
  }

  function handleProcessingError(error: string) {
    console.error("Processing error:", error)
    prevStep()
  }

  return (
    <WizardLayout
      currentStep={state.currentStep}
      onBack={state.currentStep > 1 && state.currentStep < 3 ? prevStep : undefined}
      onReset={state.currentStep > 1 ? reset : undefined}
    >
      {state.currentStep === 1 && (
        <UploadStep onComplete={handleUploadComplete} />
      )}

      {state.currentStep === 2 && state.croppedImage && (
        <OptionsStep
          croppedImage={state.croppedImage}
          options={state.options}
          onOptionsChange={handleOptionsChange}
          onNext={() => goToStep(3)}
        />
      )}

      {state.currentStep === 3 && state.croppedImage && (
        <ProcessingStep
          croppedImage={state.croppedImage}
          options={state.options}
          onComplete={handleProcessingComplete}
          onError={handleProcessingError}
        />
      )}

      {state.currentStep === 4 && state.croppedImage && (
        <CompareStep
          croppedImage={state.croppedImage}
          results={state.results}
          onNext={nextStep}
        />
      )}

      {state.currentStep === 5 && (
        <ExportStep results={state.results} onStartOver={reset} />
      )}
    </WizardLayout>
  )
}
