import React, { useRef, useEffect } from 'react';

/**
 * Textarea Component Props
 * Extends native HTML textarea attributes
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Label text displayed above the textarea
   */
  label?: string;
  /**
   * Error message displayed below the textarea
   */
  error?: string;
  /**
   * Helper text displayed below the textarea
   */
  helperText?: string;
  /**
   * Size variant
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Whether the field is required
   */
  required?: boolean;
  /**
   * Whether to auto-resize based on content
   * @default false
   */
  autoResize?: boolean;
  /**
   * Minimum rows (used with autoResize)
   * @default 3
   */
  minRows?: number;
  /**
   * Maximum rows (used with autoResize, 0 = no limit)
   * @default 0
   */
  maxRows?: number;
  /**
   * Show character counter (requires maxLength)
   * @default false
   */
  showCounter?: boolean;
}

/**
 * Textarea Component
 * 
 * A beautiful, accessible textarea component with auto-resize functionality.
 * Features:
 * - Multiple sizes (sm, md, lg)
 * - Auto-resize based on content
 * - Error state styling
 * - Helper text
 * - Character counter
 * - Focus states with ring effect
 * - Smooth transitions
 * 
 * @example
 * ```tsx
 * // Basic textarea
 * <Textarea
 *   label="Bio"
 *   placeholder="Tell us about yourself..."
 *   rows={4}
 * />
 * 
 * // Auto-resizing textarea
 * <Textarea
 *   label="Description"
 *   autoResize
 *   minRows={3}
 *   maxRows={10}
 *   maxLength={500}
 *   showCounter
 *   helperText="Enter a detailed description"
 * />
 * 
 * // With error state
 * <Textarea
 *   label="Comments"
 *   error="This field is required"
 *   required
 * />
 * ```
 */
const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  size = 'md',
  required,
  autoResize = false,
  minRows = 3,
  maxRows = 0,
  showCounter = false,
  className = '',
  id,
  value,
  onChange,
  maxLength,
  ...props
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Size classes
  const sizeClasses = {
    sm: 'py-1.5 px-3 text-sm',
    md: 'py-2.5 px-4 text-base',
    lg: 'py-3 px-4 text-lg',
  };

  // Auto-resize functionality
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const textarea = textareaRef.current;

      // Reset height to calculate scrollHeight
      textarea.style.height = 'auto';

      // Calculate height based on content
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight, 10) || 24;
      const padding = parseInt(getComputedStyle(textarea).paddingTop, 10) * 2 || 0;
      const border = parseInt(getComputedStyle(textarea).borderTopWidth, 10) * 2 || 0;

      const minHeight = lineHeight * minRows + padding + border;
      let newHeight = textarea.scrollHeight;

      if (maxRows > 0) {
        const maxHeight = lineHeight * maxRows + padding + border;
        newHeight = Math.min(newHeight, maxHeight);
      }

      newHeight = Math.max(newHeight, minHeight);
      textarea.style.height = `${newHeight}px`;
      textarea.style.overflowY = maxRows > 0 && newHeight >= lineHeight * maxRows + padding + border ? 'auto' : 'hidden';
    }
  }, [value, autoResize, minRows, maxRows]);

  // Handle resize on mount and value change
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      // Trigger resize
      const event = new Event('input', { bubbles: true });
      textareaRef.current.dispatchEvent(event);
    }
  }, [autoResize]);

  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const textareaValue = value || '';
  const currentLength = typeof textareaValue === 'string' ? textareaValue.length : 0;
  const hasMaxLength = maxLength !== undefined;

  const helperId = error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <textarea
        ref={textareaRef}
        id={textareaId}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        className={`
          w-full
          ${sizeClasses[size]}
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
          resize-none
          ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500'
          }
          disabled:bg-gray-50
          disabled:text-gray-500
          disabled:cursor-not-allowed
          ${autoResize ? 'overflow-hidden' : ''}
          ${className}
        `}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={helperId}
        {...props}
      />

      {/* Helper Text / Error Message / Counter */}
      <div className="mt-1.5 flex items-start justify-between gap-2">
        <div className="flex-1">
          {error && (
            <p
              id={`${textareaId}-error`}
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
            <p id={`${textareaId}-helper`} className="text-sm text-gray-500">
              {helperText}
            </p>
          )}
        </div>

        {/* Character Counter */}
        {showCounter && hasMaxLength && (
          <span className={`text-xs font-medium flex-shrink-0 ${
            currentLength > maxLength * 0.9
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

export default Textarea;

