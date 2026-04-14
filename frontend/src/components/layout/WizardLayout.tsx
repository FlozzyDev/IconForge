import { StepIndicator } from "@/components/shared/StepIndicator"
import { Button } from "@/components/ui/button"

interface WizardLayoutProps {
  currentStep: number
  children: React.ReactNode
  onBack?: () => void
  onReset?: () => void
}

export function WizardLayout({ currentStep, children, onBack, onReset }: WizardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">IconForge</h1>
          <div className="flex gap-2">
            {currentStep > 1 && onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                Back
              </Button>
            )}
            {onReset && (
              <Button variant="ghost" size="sm" onClick={onReset}>
                Start Over
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Step indicator */}
      <div className="max-w-5xl mx-auto px-6 pt-6">
        <StepIndicator currentStep={currentStep} />
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 pb-12">
        {children}
      </main>
    </div>
  )
}
