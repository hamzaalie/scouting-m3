import React from 'react';

/**
 * Input Component Props
 * Extends native HTML input attributes (excluding 'size' and 'prefix' which conflict)
 */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  /**
   * Label text displayed above the input
   */
  label?: string;
  /**
   * Error message displayed below the input (also adds red border)
   */
  error?: string;
  /**
   * Helper text displayed below the input (informational, not an error)
   */
  helperText?: string;
  /**
   * Icon element displayed on the left side of the input
   */
  icon?: React.ReactNode;
  /**
   * Element displayed on the right side of the input
   */
  rightElement?: React.ReactNode;
  /**
   * Text prefix displayed inside the input on the left (before value)
   */
  prefix?: React.ReactNode;
  /**
   * Text suffix displayed inside the input on the right (after value)
   */
  suffix?: React.ReactNode;
  /**
   * Size variant of the input
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Whether the field is required (adds asterisk to label)
   */
  required?: boolean;
  /**
   * Show character counter (requires maxLength to be set)
   * @default false
   */
  showCounter?: boolean;
}

/**
 * Input Component
 * 
 * A beautiful, accessible input component with comprehensive features.
 * Features:
 * - Multiple sizes (sm, md, lg)
 * - Error state styling (red border and error message)
 * - Helper text for additional information
 * - Icon support on left side
 * - Prefix/suffix text or icons
 * - Right element support (for buttons, icons, etc.)
 * - Character counter for maxLength fields
 * - Focus states with ring effect
 * - Smooth transitions
 * - Responsive design
 * 
 * @example
 * ```tsx
 * // Basic input with icon
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="you@example.com"
 *   error={errors.email}
 *   icon={<MailIcon />}
 *   required
 * />
 * 
 * // Input with prefix and character counter
 * <Input
 *   label="Website"
 *   prefix="https://"
 *   placeholder="example.com"
 *   maxLength={50}
 *   showCounter
 *   helperText="Enter your website URL"
 * />
 * 
 * // Large input with suffix
 * <Input
 *   label="Price"
 *   size="lg"
 *   suffix="USD"
 *   type="number"
 * />
 * ```
 */
const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  className = '',
  rightElement,
  prefix,
  suffix,
  size = 'md',
  required,
  showCounter = false,
  id,
  value,
  maxLength,
  disabled,
  ...props
}) => {
  // Generate unique ID if not provided (for label association)
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  // Size classes
  const sizeClasses = {
    sm: {
      input: 'py-1.5 text-sm',
      icon: 'pl-8',
      prefix: 'pl-7',
      suffix: 'pr-7',
      rightElement: 'pr-8',
    },
    md: {
      input: 'py-2.5 text-base',
      icon: 'pl-10',
      prefix: 'pl-9',
      suffix: 'pr-9',
      rightElement: 'pr-10',
    },
    lg: {
      input: 'py-3 text-lg',
      icon: 'pl-12',
      prefix: 'pl-11',
      suffix: 'pr-11',
      rightElement: 'pr-12',
    },
  };

  const currentSize = sizeClasses[size];
  const inputValue = value || '';
  const currentLength = typeof inputValue === 'string' ? inputValue.length : 0;
  const hasMaxLength = maxLength !== undefined;

  // Calculate padding classes based on what's present
  let paddingLeft = 'pl-4';
  if (icon) {
    paddingLeft = currentSize.icon;
  } else if (prefix) {
    paddingLeft = currentSize.prefix;
  }

  let paddingRight = 'pr-4';
  if (rightElement) {
    paddingRight = currentSize.rightElement;
  } else if (suffix) {
    paddingRight = currentSize.suffix;
  }

  // Helper/error text ID
  const helperId = error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
      )}
      <div className="relative">
        {/* Left Icon */}
        {icon && !prefix && (
          <div className={`absolute inset-y-0 left-0 flex items-center pointer-events-none text-gray-400 ${size === 'sm' ? 'pl-2.5' : size === 'lg' ? 'pl-3.5' : 'pl-3'
            }`}>
            <div className={`flex items-center justify-center ${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}`}>
              {icon}
            </div>
          </div>
        )}

        {/* Prefix */}
        {prefix && (
          <div className={`absolute inset-y-0 left-0 flex items-center pointer-events-none ${icon ? (size === 'sm' ? 'pl-7' : size === 'lg' ? 'pl-10' : 'pl-9') : (size === 'sm' ? 'pl-2.5' : size === 'lg' ? 'pl-3.5' : 'pl-3')
            } ${typeof prefix === 'string' ? 'text-gray-500 text-sm font-medium' : ''}`}>
            {icon && (
              <div className={`flex items-center justify-center mr-2 text-gray-400 ${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
                }`}>
                {icon}
              </div>
            )}
            {prefix}
          </div>
        )}

        {/* Input Field */}
        <input
          id={inputId}
          value={value}
          maxLength={maxLength}
          disabled={disabled}
          className={`
            w-full
            ${paddingLeft}
            ${paddingRight}
            ${currentSize.input}
            border
            rounded-lg
            bg-white
            placeholder:text-gray-400
            transition-all
            duration-200
            ease-in-out
            focus:outline-none
            focus:ring-2
            focus:ring-offset-0
            ${error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 hover:border-gray-400 focus:border-[#0066CC] focus:ring-[#0066CC] focus:ring-opacity-20'
            }
            disabled:bg-gray-50
            disabled:text-gray-500
            disabled:cursor-not-allowed
            ${className}
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={helperId}
          aria-required={required}
          {...props}
        />

        {/* Suffix */}
        {suffix && !rightElement && (
          <div className={`absolute inset-y-0 right-0 flex items-center pointer-events-none ${size === 'sm' ? 'pr-2.5' : size === 'lg' ? 'pr-3.5' : 'pr-3'
            } ${typeof suffix === 'string' ? 'text-gray-500 text-sm font-medium' : ''}`}>
            {suffix}
          </div>
        )}

        {/* Right Element */}
        {rightElement && (
          <div className={`absolute inset-y-0 right-0 flex items-center ${size === 'sm' ? 'pr-2.5' : size === 'lg' ? 'pr-3.5' : 'pr-3'
            }`}>
            {rightElement}
          </div>
        )}
      </div>

      {/* Helper Text / Error Message / Counter */}
      <div className="mt-1.5 flex items-start justify-between gap-2">
        <div className="flex-1">
          {error && (
            <p
              id={`${inputId}-error`}
              className="text-sm text-red-600 flex items-center gap-1"
              role="alert"
            >
              <svg
                className="w-4 h-4 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </p>
          )}
          {!error && helperText && (
            <p
              id={`${inputId}-helper`}
              className="text-sm text-gray-500"
            >
              {helperText}
            </p>
          )}
        </div>

        {/* Character Counter */}
        {showCounter && hasMaxLength && (
          <span className={`text-xs font-medium flex-shrink-0 ${currentLength > maxLength * 0.9
              ? 'text-red-600'
              : currentLength > maxLength * 0.7
                ? 'text-orange-600'
                : 'text-gray-500'
            }`}>
            {currentLength} / {maxLength}
          </span>
        )}
      </div>
    </div>
  );
};

export default Input;
