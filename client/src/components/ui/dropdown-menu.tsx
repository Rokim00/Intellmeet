import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuContextType {
  open: boolean
  setOpen: (open: boolean | ((prev: boolean) => boolean)) => void
}

const DropdownMenuContext = React.createContext<DropdownMenuContextType>({
  open: false,
  setOpen: () => {},
})

function DropdownMenu({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}: {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const setOpen = React.useCallback(
    (next: boolean | ((prev: boolean) => boolean)) => {
      const nextVal = typeof next === "function" ? next(open) : next
      if (!isControlled) {
        setUncontrolledOpen(nextVal)
      }
      onOpenChange?.(nextVal)
    },
    [isControlled, open, onOpenChange]
  )

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative w-full text-left">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

function DropdownMenuTrigger({
  children,
  className,
  render,
  ...props
}: React.ComponentProps<"button"> & { render?: React.ReactElement<any> }) {
  const { open, setOpen } = React.useContext(DropdownMenuContext)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setOpen((prev) => !prev)
  }

  if (render) {
    return React.cloneElement(render, {
      onClick: (e: any) => {
        render.props?.onClick?.(e)
        handleClick(e)
      },
      "aria-expanded": open,
      className: cn("border-none outline-none", render.props?.className, className),
      children: render.props?.children || children,
    })
  }

  return (
    <button
      type="button"
      data-slot="dropdown-menu-trigger"
      aria-expanded={open}
      className={cn("border-none outline-none", className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
}

function DropdownMenuPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function DropdownMenuContent({
  className,
  children,
  align = "start",
  side = "bottom",
  sideOffset = 4,
  ...props
}: React.ComponentProps<"div"> & {
  align?: "start" | "center" | "end"
  side?: "top" | "right" | "bottom" | "left"
  sideOffset?: number
}) {
  const { open, setOpen } = React.useContext(DropdownMenuContext)
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleKeyDown)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
        document.removeEventListener("keydown", handleKeyDown)
      }
    }
  }, [open, setOpen])

  if (!open) return null

  const alignClasses = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  }

  const sideClasses = {
    bottom: "top-full mt-1.5",
    top: "bottom-full mb-1.5",
    left: "right-full top-0 mr-1.5",
    right: "left-full bottom-0 ml-1.5",
  }

  return (
    <div
      ref={contentRef}
      data-slot="dropdown-menu-content"
      className={cn(
        "absolute z-50 min-w-48 rounded-lg border border-border bg-card p-1.5 text-card-foreground shadow-2xl animate-in fade-in-0 zoom-in-95",
        side === "right" ? "left-full top-0 ml-1.5" : sideClasses[side],
        side !== "right" && side !== "left" ? alignClasses[align] : "",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function DropdownMenuGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div data-slot="dropdown-menu-group" className={cn("space-y-0.5", className)} {...props} />
}

function DropdownMenuLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dropdown-menu-label"
      className={cn("px-2 py-1.5 text-xs font-semibold text-muted-foreground select-none", className)}
      {...props}
    />
  )
}

function DropdownMenuItem({
  className,
  children,
  onClick,
  render,
  ...props
}: React.ComponentProps<"button"> & { render?: React.ReactElement<any> }) {
  const { setOpen } = React.useContext(DropdownMenuContext)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    setOpen(false)
  }

  if (render) {
    return React.cloneElement(render, {
      className: cn(
        "w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer select-none",
        className,
        render.props?.className
      ),
      onClick: (e: any) => {
        render.props?.onClick?.(e)
        setOpen(false)
      },
      children: render.props?.children || children,
    })
  }

  return (
    <button
      type="button"
      data-slot="dropdown-menu-item"
      className={cn(
        "w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-left text-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer select-none",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-zinc-500",
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuPortal,
  DropdownMenuShortcut,
}
