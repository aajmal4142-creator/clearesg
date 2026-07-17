import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

/** Quality / status chips — hairline border, transparent fill, never a filled pill. */
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-[2px] border bg-transparent px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.1em] whitespace-nowrap transition-[color,border-color] focus-visible:outline-none [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-graphite text-ash",
        secondary: "border-graphite text-ash",
        outline: "border-graphite text-bone",
        ghost: "border-transparent text-ash",
        link: "border-transparent text-bone underline-offset-4",
        measured: "border-signal text-signal",
        calculated: "border-ultramarine text-ultramarine",
        estimated: "border-amber text-amber",
        missing: "border-rust text-rust",
        destructive: "border-rust text-rust",
        signal: "border-signal text-signal",
        amber: "border-amber text-amber",
        rust: "border-rust text-rust",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
