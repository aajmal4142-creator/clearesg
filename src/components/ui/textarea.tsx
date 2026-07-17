import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "surface-inset field-sizing-content flex min-h-16 w-full rounded-[4px] px-3 py-2 text-base text-bone outline-none placeholder:text-ash/60 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ultramarine focus-visible:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--ultramarine)_35%,transparent)]",
        "aria-invalid:border-rust",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
