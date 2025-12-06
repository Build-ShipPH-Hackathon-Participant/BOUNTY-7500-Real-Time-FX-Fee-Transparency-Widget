'use client'

import {
  useState,
  useId,
  useRef,
  useEffect,
  createContext,
  useContext,
} from 'react'
import {
  AnimatePresence,
  MotionConfig,
  motion,
  Transition,
} from 'framer-motion'
import { useClickOutside } from '@/hooks/use-click-outside'
import { cn } from '@/lib/utils'

const TRANSITION: Transition = {
  type: 'spring',
  bounce: 0.1,
  duration: 0.4,
}

type MorphingPopoverContextValue = {
  isOpen: boolean
  open: () => void
  close: () => void
  uniqueId: string
}

const MorphingPopoverContext =
  createContext<MorphingPopoverContextValue | null>(null)

function usePopoverLogic({
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
}: {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
} = {}) {
  const uniqueId = useId()
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)

  const isOpen = controlledOpen ?? uncontrolledOpen

  const open = () => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(true)
    }
    onOpenChange?.(true)
  }

  const close = () => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(false)
    }
    onOpenChange?.(false)
  }

  return { isOpen, open, close, uniqueId }
}

export type MorphingPopoverProps = {
  children: React.ReactNode
  transition?: Transition
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
} & React.ComponentProps<'div'>

function MorphingPopover({
  children,
  transition = TRANSITION,
  defaultOpen,
  open,
  onOpenChange,
  className,
  ...props
}: MorphingPopoverProps) {
  const popoverLogic = usePopoverLogic({ defaultOpen, open, onOpenChange })

  return (
    <MorphingPopoverContext.Provider value={popoverLogic}>
      <MotionConfig transition={transition}>
        <div
          className={cn('relative', className)}
          key={popoverLogic.uniqueId}
          {...props}
        >
          {children}
        </div>
      </MotionConfig>
    </MorphingPopoverContext.Provider>
  )
}

export type MorphingPopoverTriggerProps = {
  children: React.ReactNode
  className?: string
} & React.ComponentProps<'button'>

function MorphingPopoverTrigger({
  children,
  className,
  ...props
}: MorphingPopoverTriggerProps) {
  const context = useContext(MorphingPopoverContext)
  if (!context) {
    throw new Error(
      'MorphingPopoverTrigger must be used within MorphingPopover'
    )
  }

  return (
    <button
      onClick={context.open}
      className={className}
      aria-expanded={context.isOpen}
      aria-controls={`popover-content-${context.uniqueId}`}
      {...props}
    >
      {children}
    </button>
  )
}

export type MorphingPopoverContentProps = {
  children: React.ReactNode
  className?: string
  title?: string
} & React.ComponentProps<typeof motion.div>

function MorphingPopoverContent({
  children,
  className,
  title,
  ...props
}: MorphingPopoverContentProps) {
  const context = useContext(MorphingPopoverContext)
  if (!context)
    throw new Error(
      'MorphingPopoverContent must be used within MorphingPopover'
    )

  const ref = useRef<HTMLDivElement>(null)

  useClickOutside(ref, context.close)

  useEffect(() => {
    if (!context.isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') context.close()
    }

    // Prevent body scroll when open
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [context.isOpen, context.close])

  return (
    <AnimatePresence>
      {context.isOpen && (
        <>
          {/* Dark backdrop overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={context.close}
          />

          {/* Centered modal content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              {...props}
              ref={ref}
              id={`popover-content-${context.uniqueId}`}
              role="dialog"
              aria-modal="true"
              className={cn(
                'w-full max-w-sm overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl',
                className
              )}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
            >
              {title && (
                <div className="border-b border-gray-200 dark:border-gray-700 px-5 py-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {title}
                  </h2>
                </div>
              )}
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export { MorphingPopover, MorphingPopoverTrigger, MorphingPopoverContent }
