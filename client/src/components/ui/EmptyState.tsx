import type { LucideIcon } from 'lucide-react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  /**
   * Data-status accent only (live, warning, priority). Never a second brand
   * color, and never applied as a background behind the icon.
   */
  accentColor?: 'emerald' | 'purple' | 'blue' | 'amber';
}

const accentTextClass: Record<NonNullable<EmptyStateProps['accentColor']>, string> = {
  emerald: 'text-emerald-600 dark:text-emerald-400',
  purple: 'text-purple-600 dark:text-purple-400',
  blue: 'text-blue-600 dark:text-blue-400',
  amber: 'text-amber-600 dark:text-amber-400',
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  accentColor = 'emerald',
}) => {
  return (
    <div className="w-full max-w-xl mx-auto p-8 sm:p-12 text-center my-4">
      <div className="mx-auto flex flex-col items-center">
        {/* Bare icon, no background box */}
        <div className={`mb-4 ${accentTextClass[accentColor]}`}>
          <Icon size={26} strokeWidth={1.75} />
        </div>

        {/* Title & Description */}
        <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
          {title}
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-sm leading-relaxed">
          {description}
        </p>

        {/* Action Button */}
        {actionLabel && onAction && (
          <Button onClick={onAction} className="mt-6 active:scale-[0.98] gap-2">
            <Plus size={15} />
            <span>{actionLabel}</span>
          </Button>
        )}
      </div>
    </div>
  );
};

