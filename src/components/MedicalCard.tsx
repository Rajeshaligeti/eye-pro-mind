import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MedicalCardProps {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  noPadding?: boolean;
}

export function MedicalCard({
  title,
  subtitle,
  icon,
  children,
  className,
  padding = 'md',
  noPadding = false,
}: MedicalCardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow duration-200',
        className
      )}
    >
      {(title || icon) && (
        <div className="flex items-start gap-3 px-6 pt-6 pb-4">
          {icon && (
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            {title && <h3 className="text-lg font-semibold text-foreground">{title}</h3>}
            {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className={cn(!noPadding && paddingClasses[padding], title && 'pt-0')}>
        {children}
      </div>
    </div>
  );
}
