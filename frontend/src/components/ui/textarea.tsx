import * as React from "react"

import { cn } from "../../lib/utils"

function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-28 w-full resize-none rounded-2xl border border-[color:var(--color-border-soft)] bg-[color:var(--color-surface-muted)] px-4 py-3 text-sm leading-6 text-[color:var(--color-text-strong)] outline-none transition-colors placeholder:text-[color:var(--color-text-disabled)] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-70 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
