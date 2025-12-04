import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  expiresAt: Date;
  className?: string;
}

export const CountdownTimer = ({ expiresAt, className }: CountdownTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setIsExpired(true);
        setTimeRemaining('Expired');
        setProgress(0);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );

      // Calculate progress (72 hours = 259200000 ms)
      const totalMs = 72 * 60 * 60 * 1000;
      const elapsed = totalMs - diff;
      setProgress(Math.max(0, 100 - (elapsed / totalMs) * 100));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className={cn(
          "font-mono font-semibold",
          isExpired ? "text-destructive" : progress < 30 ? "text-warning" : "text-foreground"
        )}>
          {timeRemaining}
        </span>
        <span className="text-muted-foreground text-xs">remaining</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000",
            isExpired ? "bg-destructive" : progress < 30 ? "bg-warning" : "bg-primary"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
