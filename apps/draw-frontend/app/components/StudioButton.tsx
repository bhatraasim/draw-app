"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";

interface StudioButtonProps {
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export function StudioButton({
  variant = "primary",
  children,
  className = "",
  disabled,
  onClick,
  type = "button",
}: StudioButtonProps) {
  const baseStyles =
    "px-6 py-3 rounded-lg font-ui transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary: "bg-accent text-white hover:bg-accent/90 active:scale-[0.98]",
    secondary:
      "bg-transparent border border-ink text-ink hover:bg-ink/5 active:scale-[0.98]",
    ghost: "bg-transparent hover:bg-muted text-ink active:scale-[0.98]",
  };

  return (
    <motion.button
      type={type}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      whileHover={
        !disabled ? { y: -2, boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" } : {}
      }
      whileTap={!disabled ? { scale: 0.98 } : {}}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}
