import type { LucideIcon } from 'lucide-react';
import { Plus } from 'lucide-react';

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
      bgGlow: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      iconBox: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      btn: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40',
    },
    purple: {
      bgGlow: 'from-purple-500/10 via-purple-500/5 to-transparent',
      iconBox: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
      btn: 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-950/40',
    },
    blue: {
      bgGlow: 'from-blue-500/10 via-blue-500/5 to-transparent',
      iconBox: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      btn: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-950/40',
    },
    amber: {
      bgGlow: 'from-amber-500/10 via-amber-500/5 to-transparent',
      iconBox: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      btn: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/40',
    },
  };

  const scheme = colorMap[accentColor];

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-800/80 bg-[#121214] p-8 sm:p-12 text-center shadow-2xl">
      {/* Background radial glow */}
      <div
        className={`absolute inset-0 bg-radial ${scheme.bgGlow} pointer-events-none opacity-60`}
      />

      <div className="relative z-10 mx-auto flex max-w-md flex-col items-center">
        {/* Visual Illustration Graphic Icon */}
        <div className="relative mb-5">
          <div className="absolute -inset-2 rounded-full bg-zinc-800/40 blur-md" />
          <div
            className={`relative flex h-16 w-16 items-center justify-center rounded-2xl border ${scheme.iconBox} shadow-lg`}
          >
            <Icon size={32} />
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
          {title}
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-sm leading-relaxed">
          {description}
        </p>

        {/* Optional Action Call-To-Action Button */}
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className={`mt-6 inline-flex items-center gap-2 rounded-sm px-4 py-2.5 text-xs font-semibold shadow-md transition-all active:scale-[0.98] cursor-pointer ${scheme.btn}`}
          >
            <Plus size={15} />
            <span>{actionLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};
