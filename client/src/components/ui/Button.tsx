import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "secondary" | "destructive" | "ghost";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, disabled, loading, variant = "primary", ...props }, ref) => {
    const variants = {
      primary: "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/25",
      secondary: "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60",
      destructive: "bg-rose-600/90 hover:bg-rose-600 text-white",
      ghost: "hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-100",
    };

    return (
      <button
        className={cn(
          "inline-flex h-11 items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-150 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50",
          "disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Processing...</span>
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";