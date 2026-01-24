import { cn } from '@/lib/utils';

interface RiskBadgeProps {
  level: 'low' | 'medium' | 'high';
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function RiskBadge({ level, score, size = 'md', showLabel = true }: RiskBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const levelConfig = {
    low: {
      bg: 'bg-success/10',
      text: 'text-success',
      border: 'border-success/30',
      label: 'Low Risk',
    },
    medium: {
      bg: 'bg-warning/10',
      text: 'text-warning',
      border: 'border-warning/30',
      label: 'Medium Risk',
    },
    high: {
      bg: 'bg-destructive/10',
      text: 'text-destructive',
      border: 'border-destructive/30',
      label: 'High Risk',
    },
  };

  const config = levelConfig[level];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium border',
        sizeClasses[size],
        config.bg,
        config.text,
        config.border
      )}
    >
      <span
        className={cn(
          'w-2 h-2 rounded-full',
          level === 'low' && 'bg-success',
          level === 'medium' && 'bg-warning',
          level === 'high' && 'bg-destructive'
        )}
      />
      {showLabel && config.label}
      {score !== undefined && <span className="font-bold">{score}%</span>}
    </span>
  );
}
