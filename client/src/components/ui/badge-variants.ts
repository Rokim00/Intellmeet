import { cva, type VariantProps } from "@/lib/utils"

/**
 * Status tones. These describe *data*, never brand colors — the app's single
 * accent stays emerald, so purple/blue/amber/red only ever signal a state.
 */
export const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[11px] font-medium capitalize whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "border-border bg-secondary text-muted-foreground",
        success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        warning: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
        info: "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
        accent: "border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400",
        danger: "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  }
)

export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>["tone"]>
