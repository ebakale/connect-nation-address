import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface Step {
  label: string;
  description?: string;
  icon?: React.ElementType;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
  variant?: 'default' | 'compact';
}

export function StepIndicator({ steps, currentStep, className, variant = 'default' }: StepIndicatorProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Mobile: compact horizontal dots */}
      {variant === 'compact' ? (
        <div className="flex items-center justify-center gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                index === currentStep ? 'w-6 bg-primary' :
                index < currentStep ? 'w-2 bg-primary/60' : 'w-2 bg-muted-foreground/20'
              )}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center w-full">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const StepIcon = step.icon;

            return (
              <div key={index} className={cn('flex items-center', index < steps.length - 1 ? 'flex-1' : '')}>
                {/* Step circle */}
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-semibold transition-all duration-300',
                      isCompleted
                        ? 'bg-primary border-primary text-primary-foreground'
                        : isCurrent
                        ? 'border-primary text-primary bg-primary/10'
                        : 'border-muted-foreground/30 text-muted-foreground'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : StepIcon ? (
                      <StepIcon className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="text-center hidden sm:block max-w-[100px]">
                    <p className={cn(
                      'text-xs font-medium leading-tight',
                      isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      {step.label}
                    </p>
                  </div>
                </div>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className={cn(
                    'flex-1 h-0.5 mx-2 transition-all duration-300',
                    isCompleted ? 'bg-primary' : 'bg-muted-foreground/20'
                  )} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
