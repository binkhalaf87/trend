import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  label: string;
}

interface ProgressStepsProps {
  steps: Step[];
  current: number;
}

export function ProgressSteps({ steps, current }: ProgressStepsProps) {
  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="relative flex items-center justify-between mb-2">
        {/* Connecting line */}
        <div className="absolute top-4 right-4 left-4 h-0.5 bg-border" />
        <div
          className="absolute top-4 right-4 h-0.5 bg-primary transition-all duration-500"
          style={{ width: `${((current - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step) => {
          const done    = step.id < current;
          const active  = step.id === current;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all",
                  done   && "bg-primary border-primary text-white",
                  active && "bg-background border-primary text-primary ring-4 ring-primary/20",
                  !done && !active && "bg-background border-border text-muted-foreground"
                )}
              >
                {done ? <Check className="h-4 w-4" /> : step.id}
              </div>
            </div>
          );
        })}
      </div>

      {/* Labels */}
      <div className="flex justify-between">
        {steps.map((step) => (
          <span
            key={step.id}
            className={cn(
              "text-xs font-medium text-center w-16 leading-tight",
              step.id === current ? "text-primary" : "text-muted-foreground"
            )}
          >
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );
}
