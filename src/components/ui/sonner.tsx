"use client";

import * as React from "react";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="bottom-right"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "surface-2 !rounded-[4px] !border-t-[color:var(--highlight-border)] !border-b-[color:var(--shade-border)] !text-bone",
        },
      }}
      style={
        {
          "--normal-bg": "var(--surface-2)",
          "--normal-text": "var(--bone)",
          "--normal-border": "var(--graphite)",
          "--border-radius": "4px",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
