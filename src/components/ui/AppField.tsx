import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const fieldClass =
  "w-full rounded-[4px] border border-rule bg-surface-1 px-2 py-2 text-sm text-ink placeholder:text-ink-muted focus-visible:border-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50";

export function AppField({
  className,
  label,
  id,
  ...props
}: ComponentProps<"input"> & { label?: string }) {
  const inputId = id ?? props.name;
  return (
    <label className="flex flex-col gap-1 text-xs text-ink-muted">
      {label ? <span className="label-caps">{label}</span> : null}
      <input
        id={inputId}
        className={cn(fieldClass, "font-inherit", className)}
        {...props}
      />
    </label>
  );
}

export function AppSelectNative({
  className,
  label,
  id,
  children,
  ...props
}: ComponentProps<"select"> & { label?: string }) {
  const selectId = id ?? props.name;
  return (
    <label className="flex flex-col gap-1 text-xs text-ink-muted">
      {label ? <span className="label-caps">{label}</span> : null}
      <select id={selectId} className={cn(fieldClass, className)} {...props}>
        {children}
      </select>
    </label>
  );
}

export { fieldClass as appFieldClass };
