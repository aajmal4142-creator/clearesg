"use client";

import * as React from "react";
import { motion } from "motion/react";

import { springSnap, usePrefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "sticky top-0 z-10 border-b border-graphite bg-surface-1/90 backdrop-blur-[8px] [&_tr]:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("border-t border-graphite bg-surface-1 font-medium", className)}
      {...props}
    />
  );
}

function TableRow({
  className,
  children,
  onMouseEnter,
  onMouseLeave,
  ...props
}: React.ComponentProps<"tr">) {
  const reduced = usePrefersReducedMotion();
  const [hovered, setHovered] = React.useState(false);

  return (
    <tr
      data-slot="table-row"
      className={cn(
        "relative border-b border-graphite/60 odd:bg-[color-mix(in_srgb,var(--surface-1)_40%,transparent)] data-[state=selected]:bg-surface-1",
        className,
      )}
      onMouseEnter={(e) => {
        setHovered(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        onMouseLeave?.(e);
      }}
      {...props}
    >
      {!reduced ? (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-0.5 origin-top bg-signal"
          initial={false}
          animate={{ scaleY: hovered ? 1 : 0 }}
          transition={springSnap}
        />
      ) : null}
      {children}
    </tr>
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "label-caps h-10 px-2 text-left align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-ash", className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
