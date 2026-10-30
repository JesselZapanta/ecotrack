import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-[8px] border border-line-strong bg-surface px-3 py-2 text-[13.5px] text-ink transition-[border-color,box-shadow] outline-none",
        "placeholder:text-muted-ink/70",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-[12.5px] file:font-medium file:text-ink",
        "focus-visible:border-brand focus-visible:shadow-[0_0_0_3px_rgba(14,74,54,0.12)]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-surface-2 disabled:opacity-60",
        "aria-invalid:border-alarm aria-invalid:shadow-[0_0_0_3px_rgba(180,35,24,0.1)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
