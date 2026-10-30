import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-[6px] border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-transparent bg-brand text-white",
        secondary: "border-line bg-surface-2 text-ink-2",
        destructive: "border-transparent bg-alarm text-white",
        outline: "border-line-strong bg-surface text-ink-2",
        soft: "border-brand/15 bg-brand-soft text-brand-ink",
        success: "border-ok/20 bg-ok-soft text-ok",
        warning: "border-warn/20 bg-warn-soft text-warn",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
