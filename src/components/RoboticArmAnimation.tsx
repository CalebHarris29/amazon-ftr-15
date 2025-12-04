import { Bot, ScanEye, ShieldCheck, AlertTriangle, Box } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface RoboticArmAnimationProps {
  isScanning?: boolean;
  stage?: number;
}

export const RoboticArmAnimation = ({ isScanning = false, stage = 0 }: RoboticArmAnimationProps) => {
  const [scanLine, setScanLine] = useState(0);

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setScanLine((prev) => (prev + 2) % 100);
      }, 30);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square bg-gradient-to-br from-secondary to-muted rounded-2xl overflow-hidden border border-border">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: 'linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
      </div>

      {/* Package */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className={cn(
          "w-24 h-20 bg-amber-100 border-2 border-amber-300 rounded-lg shadow-lg flex items-center justify-center transition-all duration-500",
          isScanning && "shadow-glow"
        )}>
          <Box className="w-10 h-10 text-amber-600" />
        </div>
      </div>

      {/* Robotic Arm */}
      <div className="absolute top-4 right-4">
        <div className={cn(
          "w-8 h-32 bg-gradient-to-b from-muted-foreground to-muted-foreground/70 rounded-t-full origin-top",
          isScanning && "animate-robot-arm"
        )}>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-8 bg-muted-foreground rounded-lg flex items-center justify-center">
            <Bot className={cn(
              "w-6 h-6 text-primary",
              isScanning && "animate-pulse"
            )} />
          </div>
        </div>
      </div>

      {/* Scan line */}
      {isScanning && (
        <div
          className="absolute left-8 right-8 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80"
          style={{ top: `${20 + scanLine * 0.6}%` }}
        />
      )}

      {/* Stage indicators */}
      <div className="absolute top-4 left-4 space-y-2">
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
          stage >= 1 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
        )}>
          <ScanEye className="w-3 h-3" />
          Scanning
        </div>
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
          stage >= 2 ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
        )}>
          <ShieldCheck className="w-3 h-3" />
          Verifying
        </div>
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
          stage >= 3 ? "bg-warning/20 text-warning" : "bg-muted text-muted-foreground"
        )}>
          <AlertTriangle className="w-3 h-3" />
          Analyzing
        </div>
      </div>

      {/* Detection boxes overlay */}
      {stage >= 2 && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
          <div className="relative">
            <div className="absolute -inset-2 border-2 border-primary border-dashed rounded animate-pulse" />
            <div className="absolute -top-1 -left-1 w-3 h-3 border-l-2 border-t-2 border-primary" />
            <div className="absolute -top-1 -right-1 w-3 h-3 border-r-2 border-t-2 border-primary" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-l-2 border-b-2 border-primary" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r-2 border-b-2 border-primary" />
          </div>
        </div>
      )}
    </div>
  );
};
