import type { ComponentProps } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      // Solid variants share the `.btn` physical-button treatment in globals.css:
      // a lit top edge, a darker underside, and a press-in on :active.
      variant: {
        default: "btn btn-default",
        ink: "btn btn-ink",
        destructive: "btn btn-destructive",
        outline: "btn btn-outline",
        secondary: "btn btn-secondary",
        ghost:
          "transition-[color,background-color,transform] hover:bg-accent hover:text-accent-foreground hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 active:translate-y-0 active:scale-[0.97] active:bg-secondary",
        link: "text-primary underline-offset-4 transition-colors hover:underline active:underline",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-11 px-3",
        lg: "h-12 px-8",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
