import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all duration-300 outline-none select-none active:scale-95 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 font-display",
  {
    variants: {
      variant: {
        default: "bg-primary text-on-primary hover:bg-primary/90 shadow-ambient",
        outline:
          "border-outline-variant/30 bg-transparent text-on-surface hover:bg-surface-highest/50",
        secondary:
          "bg-surface-highest text-on-surface hover:bg-surface-highest/80",
        ghost:
          "hover:bg-surface-highest/50 text-on-surface-variant hover:text-on-surface",
        destructive:
          "bg-red-500/10 text-red-500 hover:bg-red-500/20",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 gap-2",
        xs: "h-7 px-3 text-xs gap-1",
        sm: "h-9 px-4 text-sm gap-1.5",
        lg: "h-13 px-8 text-base gap-2.5",
        icon: "size-11",
        "icon-xs": "size-7",
        "icon-sm": "size-9",
        "icon-lg": "size-13",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
