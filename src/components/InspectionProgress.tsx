import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface InspectionProgressProps {
  currentStage: number;
  stages: { id: number; name: string; icon: string }[];
}

export const InspectionProgress = ({ currentStage, stages }: InspectionProgressProps) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-border rounded-full mx-8">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${Math.min((currentStage / stages.length) * 100, 100)}%` }}
          />
        </div>

        {stages.map((stage, index) => {
          const isCompleted = index < currentStage;
          const isCurrent = index === currentStage;

          return (
            <div
              key={stage.id}
              className="flex flex-col items-center relative z-10"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                  isCompleted
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : isCurrent
                    ? "bg-primary/20 text-primary border-2 border-primary animate-pulse-ring"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{stage.id}</span>
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs font-medium text-center max-w-[80px]",
                  isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {stage.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
