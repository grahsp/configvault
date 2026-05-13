import * as React from "react"

import { cn } from "../../lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(
        "flex h-12 w-full min-w-0 rounded-2xl border border-[color:var(--color-border-soft)] bg-[color:var(--color-surface-muted)] px-4 py-3 text-sm text-[color:var(--color-text-strong)] outline-none transition-colors placeholder:text-[color:var(--color-text-disabled)] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-70 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
