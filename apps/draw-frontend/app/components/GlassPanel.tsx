"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

export function GlassPanel({
  children,
  className = "",
  animate = true,
}: GlassPanelProps) {
  if (animate) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`glass-panel rounded-xl ${className}`}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={`glass-panel rounded-xl ${className}`}>{children}</div>
  );
}
