import { cn } from '@/lib/utils';

interface FraudScoreMeterProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export const FraudScoreMeter = ({ score, size = 'md' }: FraudScoreMeterProps) => {
  const getColor = () => {
    if (score > 90) return 'text-destructive';
    if (score > 70) return 'text-warning';
    return 'text-success';
  };

  const getBgColor = () => {
    if (score > 90) return 'bg-destructive';
    if (score > 70) return 'bg-warning';
    return 'bg-success';
  };

  const sizeClasses = {
    sm: 'w-16 h-16 text-lg',
    md: 'w-24 h-24 text-2xl',
    lg: 'w-32 h-32 text-3xl',
  };

  const strokeWidth = size === 'sm' ? 4 : size === 'md' ? 6 : 8;
  const radius = size === 'sm' ? 28 : size === 'md' ? 42 : 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", sizeClasses[size])}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={cn("transition-all duration-1000", getBgColor())}
        />
      </svg>
      <span className={cn("absolute font-bold", getColor())}>{score}</span>
    </div>
  );
};
