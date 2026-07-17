"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

import { houseSpring, useMotionSafe } from "@/lib/motion";

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const transition = useMotionSafe();
  return (
    <motion.div
      className={className}
      initial={transition.type === "tween" ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        ...(transition.type === "tween" ? transition : houseSpring),
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
