const STEPS = [
  "Upload & Crop",
  "Background Removal",
  "Output Type",
  "Processing",
  "Export",
]

interface StepIndicatorProps {
  currentStep: number
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((label, i) => {
        const stepNum = i + 1
        const isActive = stepNum === currentStep
        const isDone = stepNum < currentStep

        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${isActive ? "bg-primary text-primary-foreground" : ""}
                  ${isDone ? "bg-primary/20 text-primary" : ""}
                  ${!isActive && !isDone ? "bg-muted text-muted-foreground" : ""}
                `}
              >
                {isDone ? "\u2713" : stepNum}
              </div>
              <span
                className={`text-sm hidden sm:inline ${
                  isActive ? "font-medium" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="w-8 h-px bg-border" />
            )}
          </div>
        )
      })}
    </div>
  )
}
