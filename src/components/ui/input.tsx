import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-xl border border-outline-variant/10 bg-surface-lowest px-6 py-2 text-base transition-all duration-300 outline-none placeholder:text-on-surface-variant/50 focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10 disabled:opacity-50 md:text-sm font-sans",
        className
      )}
      {...props}
    />
  )
}

export { Input }
