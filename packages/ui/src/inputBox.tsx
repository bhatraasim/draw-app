
import React, { forwardRef, InputHTMLAttributes } from 'react';

type InputSize = 'sm' | 'md' | 'lg';
type InputVariant = 'default' | 'filled' | 'minimal';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  variant?: InputVariant;
  size?: InputSize;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ 
  label,
  error,
  helperText,
  className = '',
  containerClassName = '',
  variant = 'default',
  size = 'md',
  icon,
  ...props 
}, ref) => {
  const sizeClasses: Record<InputSize, string> = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-12 px-5 text-lg'
  };

  const variantClasses: Record<InputVariant, string> = {
    default: 'bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100',
    filled: 'bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white',
    minimal: 'bg-transparent border-b-2 border-gray-300 focus:border-blue-500 rounded-none px-2'
  };

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          className={`
            w-full
            ${sizeClasses[size]}
            ${variantClasses[variant]}
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}
            rounded-lg
            font-medium
            text-gray-900
            placeholder:text-gray-400
            transition-all
            duration-200
            outline-none
            disabled:bg-gray-100
            disabled:text-gray-500
            disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
      </div>

      {(error || helperText) && (
        <p className={`mt-1.5 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';