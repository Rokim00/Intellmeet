import * as React from "react"
import { cn } from "@/lib/utils"

interface CollapsibleContextType {
  open: boolean
  setOpen: (open: boolean | ((prev: boolean) => boolean)) => void
}

const CollapsibleContext = React.createContext<CollapsibleContextType>({
  open: false,
  setOpen: () => {},
})

function Collapsible({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
  className,
  asChild = false,
  render,
  ...props
}: React.ComponentProps<"div"> & {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  asChild?: boolean
  render?: React.ReactElement<any>
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const setOpen = React.useCallback(
    (next: boolean | ((prev: boolean) => boolean)) => {
      const nextValue = typeof next === "function" ? next(open) : next
      if (!isControlled) {
        setUncontrolledOpen(nextValue)
      }
      onOpenChange?.(nextValue)
    },
    [isControlled, open, onOpenChange]
  )

  if (render) {
    return (
      <CollapsibleContext.Provider value={{ open, setOpen }}>
        {React.cloneElement(render, {
          "data-slot": "collapsible",
          "data-state": open ? "open" : "closed",
          className: render.props?.className ? `${className || ""} ${render.props.className}` : className,
          children,
        })}
      </CollapsibleContext.Provider>
    )
  }

  return (
    <CollapsibleContext.Provider value={{ open, setOpen }}>
      <div
        data-slot="collapsible"
        data-state={open ? "open" : "closed"}
        className={className}
        {...props}
      >
        {children}
      </div>
    </CollapsibleContext.Provider>
  )
}

function CollapsibleTrigger({
  children,
  onClick,
  className,
  asChild = false,
  render,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean; render?: React.ReactElement<any> }) {
  const { open, setOpen } = React.useContext(CollapsibleContext)

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    onClick?.(e as any)
    setOpen((prev) => !prev)
  }

  if (render) {
    return React.cloneElement(render, {
      "data-slot": "collapsible-trigger",
      "data-state": open ? "open" : "closed",
      "aria-expanded": open,
      className: cn("border-none outline-none", render.props?.className, className),
      onClick: (e: any) => {
        render.props?.onClick?.(e)
        handleClick(e)
      },
      children: children ?? render.props?.children,
    })
  }

  return (
    <button
      type="button"
      data-slot="collapsible-trigger"
      data-state={open ? "open" : "closed"}
      aria-expanded={open}
      onClick={handleClick}
      className={cn("border-none outline-none", className)}
      {...props}
    >
      {children}
    </button>
  )
}

function CollapsibleContent({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { open } = React.useContext(CollapsibleContext)

  if (!open) return null

  return (
    <div
      data-slot="collapsible-content"
      data-state={open ? "open" : "closed"}
      className={className}
      {...props}
    >
      {children}
    </div>
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
