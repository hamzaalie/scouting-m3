import React from 'react';

/**
 * Button Component Props
 * Extends native HTML button attributes
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button variant style
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'outline' | 'ghost';
  /**
   * Button size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Button content
   */
  children: React.ReactNode;
  /**
   * Show loading spinner and disable button
   * @default false
   */
  loading?: boolean;
  /**
   * Icon to display (left side)
   */
  icon?: React.ReactNode;
  /**
   * Icon to display (right side)
   */
  iconRight?: React.ReactNode;
  /**
   * Make button full width
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Button Component
 * 
 * A beautiful, accessible button component with variants, sizes, icons, and loading states.
 * 
 * Features:
 * - Multiple variants (primary, secondary, danger, success, warning, outline, ghost)
 * - Three sizes (sm, md, lg)
 * - Loading state with spinner
 * - Icon support (left or right)
 * - Full width option
 * - Smooth transitions and hover effects
 * - Disabled state styling
 * - Focus states for accessibility
 * - Active state for better UX
 * 
 * @example
 * ```tsx
 * // Basic button
 * <Button variant="primary" size="lg" loading={isSubmitting}>
 *   Submit
 * </Button>
 * 
 * // Button with icon
 * <Button variant="success" icon={<CheckIcon />}>
 *   Save
 * </Button>
 * 
 * // Ghost button
 * <Button variant="ghost" iconRight={<ArrowIcon />}>
 *   Next
 * </Button>
 * 
 * // Full width button
 * <Button variant="primary" fullWidth>
 *   Submit Form
 * </Button>
 * ```
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  loading = false,
  disabled,
  icon,
  iconRight,
  fullWidth = false,
  ...props
}) => {
  const baseStyles = `
    inline-flex
    items-center
    justify-center
    font-medium
    rounded-lg
    transition-all
    duration-200
    ease-in-out
    focus:outline-none
    focus:ring-2
    focus:ring-offset-2
    disabled:opacity-60
    disabled:cursor-not-allowed
    disabled:transform-none
    active:scale-[0.98]
    ${fullWidth ? 'w-full' : ''}
  `;

  const variantStyles = {
    primary: `
      bg-[#0066CC]
      text-white
      hover:bg-[#1a75d9]
      hover:shadow-[0_8px_20px_rgba(0,102,204,0.3)]
      hover:-translate-y-0.5
      focus:ring-[#0066CC]
      active:bg-[#0052a3]
    `,
    secondary: `
      bg-slate-700
      text-white
      hover:bg-slate-800
      hover:shadow-md
      focus:ring-slate-600
      active:bg-slate-900
    `,
    danger: `
      bg-red-600
      text-white
      hover:bg-red-700
      hover:shadow-md
      focus:ring-red-500
      active:bg-red-800
    `,
    success: `
      bg-green-600
      text-white
      hover:bg-green-700
      hover:shadow-md
      focus:ring-green-500
      active:bg-green-800
    `,
    warning: `
      bg-amber-500
      text-white
      hover:bg-amber-600
      hover:shadow-md
      focus:ring-amber-500
      active:bg-amber-700
    `,
    outline: `
      bg-white
      text-gray-800
      border
      border-gray-300
      hover:bg-gray-50
      hover:border-gray-400
      hover:shadow-sm
      focus:ring-blue-500
      active:bg-gray-100
    `,
    ghost: `
      bg-transparent
      text-gray-700
      hover:bg-gray-100
      hover:text-gray-900
      focus:ring-gray-500
      active:bg-gray-200
    `,
  } as const;

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm gap-1.5 min-h-[44px]',
    md: 'px-4 py-2 text-base gap-2 min-h-[44px]',
    lg: 'px-6 py-3 text-lg gap-2 min-h-[44px]',
  } as const;

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      type={props.type || "button"}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <svg
          className={`animate-spin ${iconSizes[size]} text-current`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
      ) : (
        <>
          {icon && <span className={iconSizes[size]}>{icon}</span>}
          {children}
          {iconRight && <span className={iconSizes[size]}>{iconRight}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
