import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  const numeric =
    type === "number" || props.inputMode === "decimal" || props.inputMode === "numeric";

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "surface-inset h-9 w-full min-w-0 rounded-[4px] px-3 py-1 text-base text-bone outline-none placeholder:text-ash/60 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ultramarine focus-visible:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--ultramarine)_35%,transparent)]",
        "aria-invalid:border-rust",
        numeric && "font-data",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
