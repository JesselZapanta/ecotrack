import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[96px] w-full rounded-[8px] border border-line-strong bg-surface px-3 py-2.5 text-[13.5px] leading-6 text-ink transition-[border-color,box-shadow] outline-none placeholder:text-muted-ink/70 focus-visible:border-brand focus-visible:shadow-[0_0_0_3px_rgba(14,74,54,0.12)] disabled:cursor-not-allowed disabled:bg-surface-2 disabled:opacity-60 aria-invalid:border-alarm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
