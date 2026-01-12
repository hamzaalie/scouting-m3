import React from 'react';

/**
 * Checkbox Component Props
 */
export interface CheckboxProps {
  /**
   * Label text displayed next to the checkbox
   */
  label?: string;
  /**
   * Description text displayed below the label
   */
  description?: string;
  /**
   * Whether the checkbox is checked
   */
  checked?: boolean;
  /**
   * Whether the checkbox is in an indeterminate state
   */
  indeterminate?: boolean;
  /**
   * Callback when checkbox state changes
   */
  onChange?: (checked: boolean) => void;
  /**
   * Error message
   */
  error?: string;
  /**
   * Whether the checkbox is disabled
   */
  disabled?: boolean;
  /**
   * Size variant
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Additional className
   */
  className?: string;
  /**
   * HTML id attribute
   */
  id?: string;
  /**
   * HTML name attribute
   */
  name?: string;
}

/**
 * Checkbox Component
 * 
 * A beautiful, accessible checkbox component with custom styling.
 * Features:
 * - Multiple sizes (sm, md, lg)
 * - Indeterminate state support
 * - Label with optional description
 * - Error state
 * - Smooth animations
 * - Focus states
 * - Keyboard accessible
 * 
 * @example
 * ```tsx
 * // Basic checkbox
 * <Checkbox
 *   label="I agree to the terms and conditions"
 *   checked={agreed}
 *   onChange={(checked) => setAgreed(checked)}
 * />
 * 
 * // Checkbox with description
 * <Checkbox
 *   label="Subscribe to newsletter"
 *   description="Receive updates about new features and matches"
 *   checked={subscribed}
 *   onChange={(checked) => setSubscribed(checked)}
 * />
 * 
 * // Small checkbox with error
 * <Checkbox
 *   label="Required field"
 *   size="sm"
 *   error="This field is required"
 *   required
 * />
 * ```
 */
const Checkbox: React.FC<CheckboxProps> = ({
  label,
  description,
  checked = false,
  indeterminate = false,
  onChange,
  error,
  disabled,
  size = 'md',
  className = '',
  id,
  name,
}) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  const checkboxRef = React.useRef<HTMLInputElement>(null);

  // Size classes
  const sizeClasses = {
    sm: {
      checkbox: 'w-4 h-4',
      icon: 'w-2.5 h-2.5',
      label: 'text-sm',
    },
    md: {
      checkbox: 'w-5 h-5',
      icon: 'w-3 h-3',
      label: 'text-base',
    },
    lg: {
      checkbox: 'w-6 h-6',
      icon: 'w-4 h-4',
      label: 'text-lg',
    },
  };

  const currentSize = sizeClasses[size];

  // Handle indeterminate state
  React.useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  // Handle change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange && !disabled) {
      onChange(e.target.checked);
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-start gap-3">
        {/* Checkbox Input */}
        <div className="relative flex-shrink-0 mt-0.5">
          <input
            ref={checkboxRef}
            type="checkbox"
            id={checkboxId}
            name={name}
            checked={checked && !indeterminate}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only"
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${checkboxId}-error` : description ? `${checkboxId}-description` : undefined}
          />
          
          {/* Custom Checkbox */}
          <label
            htmlFor={checkboxId}
            className={`
              ${currentSize.checkbox}
              flex
              items-center
              justify-center
              border-2
              rounded
              transition-all
              duration-200
              ease-in-out
              cursor-pointer
              ${
                error
                  ? 'border-red-500'
                  : checked || indeterminate
                  ? 'border-blue-600 bg-blue-600'
                  : 'border-gray-300 bg-white'
              }
              ${
                disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2'
              }
            `}
          >
            {/* Check Icon */}
            {checked && !indeterminate && (
              <svg
                className={`${currentSize.icon} text-white animate-scale-up`}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}

            {/* Indeterminate Icon */}
            {indeterminate && (
              <svg
                className={`${currentSize.icon} text-white animate-scale-up`}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </label>
        </div>

        {/* Label and Description */}
        {label && (
          <div className="flex-1">
            <label
              htmlFor={checkboxId}
              className={`
                ${currentSize.label}
                font-medium
                cursor-pointer
                select-none
                ${
                  disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : error
                    ? 'text-red-600'
                    : 'text-gray-700'
                }
              `}
            >
              {label}
            </label>
            {description && (
              <p
                id={`${checkboxId}-description`}
                className="mt-1 text-sm text-gray-500"
              >
                {description}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p
          id={`${checkboxId}-error`}
          className="mt-2 text-sm text-red-600 flex items-center gap-1"
          role="alert"
        >
          <svg
            className="w-4 h-4 flex-shrink-0"
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

      <style>{`
        @keyframes scale-up {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-scale-up {
          animation: scale-up 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Checkbox;

