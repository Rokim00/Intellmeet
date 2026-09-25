import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  footer?: React.ReactNode
  children: React.ReactNode
  className?: string
}

/**
 * Centered modal used for every create/edit/confirm flow. Owns the overlay,
 * Escape handling, backdrop dismissal, focus containment and scroll locking, so
 * individual dialogs only supply content.
 */
const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  description,
  footer,
  children,
  className,
}) => {
  const titleId = React.useId()
  const panelRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", onKeyDown)

    const previouslyFocused = document.activeElement as HTMLElement | null
    const { overflow } = document.body.style
    document.body.style.overflow = "hidden"
    panelRef.current?.focus()

    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = overflow
      previouslyFocused?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className={cn(
          "w-full max-w-md space-y-5 rounded-md border border-border bg-card p-6 shadow-2xl outline-none",
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-bold leading-tight text-foreground">
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label={`Close ${title}`}
          >
            <X size={16} />
          </Button>
        </div>

        {children}

        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

const ModalFooterCancel: React.FC<{ onClick: () => void; disabled?: boolean }> = ({
  onClick,
  disabled,
}) => (
  <Button type="button" variant="secondary" onClick={onClick} disabled={disabled}>
    Cancel
  </Button>
)

export { Modal, ModalFooterCancel }
