"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface StudioInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  showPasswordToggle?: boolean;
}

export const StudioInput = forwardRef<HTMLInputElement, StudioInputProps>(
  (
    { label, error, showPasswordToggle, type, className = "", ...props },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = showPasswordToggle
      ? showPassword
        ? "text"
        : "password"
      : type;

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="text-sm font-ui font-medium text-ink">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={`
              w-full px-4 py-3 bg-white border-b-2 border-muted
              focus:border-accent focus:outline-none
              transition-colors duration-200
              font-ui text-ink placeholder:text-ink/40
              ${error ? "border-danger animate-shake" : ""}
              ${className}
            `}
            {...props}
          />
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
        {error && (
          <span className="text-sm text-danger font-ui animate-shake">
            {error}
          </span>
        )}
      </div>
    );
  },
);

StudioInput.displayName = "StudioInput";
