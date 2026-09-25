import type { LucideIcon } from 'lucide-react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  accentColor?: 'emerald' | 'purple' | 'blue' | 'amber';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  accentColor = 'emerald',
}) => {
  const colorMap = {
    emerald: {
      iconBox: 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/25 text-emerald-600 dark:text-emerald-400',
      btn: '',
    },
    purple: {
      iconBox: 'bg-purple-500/10 dark:bg-purple-500/15 border-purple-500/25 text-purple-600 dark:text-purple-400',
      btn: 'bg-purple-600 hover:bg-purple-500 text-white',
    },
    blue: {
      iconBox: 'bg-blue-500/10 dark:bg-blue-500/15 border-blue-500/25 text-blue-600 dark:text-blue-400',
      btn: 'bg-blue-600 hover:bg-blue-500 text-white',
    },
    amber: {
      iconBox: 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/25 text-amber-600 dark:text-amber-400',
      btn: 'bg-amber-600 hover:bg-amber-500 text-white',
    },
  };

  const scheme = colorMap[accentColor];

  return (
    <div className="w-full max-w-xl mx-auto p-8 sm:p-12 text-center my-4">
      <div className="mx-auto flex flex-col items-center">
        {/* Crisp Icon Container - Clean, Sharp, No blur halo */}
        <div
          className={`mb-4 flex h-14 w-14 items-center justify-center rounded-md border ${scheme.iconBox} shadow-xs`}
        >
          <Icon size={26} strokeWidth={2} />
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
          <Button
            onClick={onAction}
            className={`mt-6 active:scale-[0.98] shadow-xs gap-2 ${scheme.btn}`}
          >
            <Plus size={15} />
            <span>{actionLabel}</span>
          </Button>
        )}
      </div>
    </div>
  );
};

