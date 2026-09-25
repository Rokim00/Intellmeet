import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipContextType {
  open: boolean
  setOpen: (open: boolean) => void
  delay: number
}

const TooltipContext = React.createContext<TooltipContextType | null>(null)

function TooltipProvider({
  children,
}: {
  children: React.ReactNode
  delayDuration?: number
}) {
  return <>{children}</>
}

function Tooltip({
  children,
  className,
  delayDuration = 200,
}: {
  children: React.ReactNode
  className?: string
  delayDuration?: number
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <TooltipContext.Provider value={{ open, setOpen, delay: delayDuration }}>
      <div className={cn("relative flex w-full group/tooltip", className)}>{children}</div>
    </TooltipContext.Provider>
  )
}

function TooltipTrigger({
  children,
  className,
  asChild,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const ctx = React.useContext(TooltipContext)

  const handleMouseEnter = () => ctx?.setOpen(true)
  const handleMouseLeave = () => ctx?.setOpen(false)
  const handleFocus = () => ctx?.setOpen(true)
  const handleBlur = () => ctx?.setOpen(false)

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onMouseEnter: (e: any) => {
        (children as any).props?.onMouseEnter?.(e)
        handleMouseEnter()
      },
      onMouseLeave: (e: any) => {
        (children as any).props?.onMouseLeave?.(e)
        handleMouseLeave()
      },
      onFocus: (e: any) => {
        (children as any).props?.onFocus?.(e)
        handleFocus()
      },
      onBlur: (e: any) => {
        (children as any).props?.onBlur?.(e)
        handleBlur()
      },
    })
  }

  return (
    <button
      type="button"
      className={cn("inline-flex", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    >
      {children}
    </button>
  )
}

function TooltipContent({
  className,
  side = "top",
  align = "center",
  hidden = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  hidden?: boolean
}) {
  const ctx = React.useContext(TooltipContext)
  if (!ctx?.open || hidden) return null

  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  }

  return (
    <div
      data-slot="tooltip-content"
      role="tooltip"
      className={cn(
        "absolute z-50 whitespace-nowrap rounded-md bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-xs text-zinc-100 shadow-md animate-in fade-in-0 zoom-in-95 pointer-events-none",
        sideClasses[side],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
