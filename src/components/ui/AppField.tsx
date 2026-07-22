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
      <select
        id={selectId}
        className={cn(
          fieldClass,
          "appearance-none bg-[length:1rem] bg-[right_0.5rem_center] bg-no-repeat pr-8",
          className,
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b645c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        }}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export { fieldClass as appFieldClass };
