import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SelectOption<T extends string = string> {
  value: T
  label: string
}

/**
 * Native <select> with the project's field styling. Stays native so keyboard
 * behaviour, mobile pickers, and screen readers work without extra code.
 */
const Select = React.forwardRef<
  HTMLSelectElement,
  Omit<React.ComponentProps<"select">, "children"> & {
    options: SelectOption[]
    wrapperClassName?: string
  }
>(
  (
    { className, options, wrapperClassName, ...props },
    ref
  ) => {
    return (
      <div className={cn("relative", wrapperClassName)}>
        <select
          ref={ref}
          data-slot="select"
          className={cn(
            "h-10 w-full appearance-none rounded-md border border-border bg-card pl-3 pr-9 text-foreground shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          size={14}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
