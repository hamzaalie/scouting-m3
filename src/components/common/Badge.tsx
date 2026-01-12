import React from 'react';

/**
 * Badge Component Props
 */
interface BadgeProps {
  /**
   * Badge content (text)
   */
  children: React.ReactNode;
  /**
   * Badge variant/color
   * @default 'primary'
   */
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
  /**
   * Badge size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Badge Component
 * 
 * A small pill-shaped component for displaying status, labels, or tags.
 * 
 * Use cases:
 * - Player position badges
 * - Match status indicators
 * - Card labels
 * - Status tags
 * 
 * @example
 * ```tsx
 * // Basic badge
 * <Badge variant="success">Active</Badge>
 * 
 * // Player position
 * <Badge variant="primary">Forward</Badge>
 * 
 * // Match status
 * <Badge variant="warning" size="sm">Scheduled</Badge>
 * 
 * // Danger badge
 * <Badge variant="danger">Cancelled</Badge>
 * ```
 */
const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}) => {
  const baseStyles = `
    inline-flex
    items-center
    justify-center
    font-medium
    rounded-full
    transition-colors
    duration-200
  `;

  const variantStyles = {
    primary: 'bg-blue-100 text-blue-800 border border-blue-200',
    success: 'bg-green-100 text-green-800 border border-green-200',
    warning: 'bg-amber-100 text-amber-800 border border-amber-200',
    danger: 'bg-red-100 text-red-800 border border-red-200',
    info: 'bg-cyan-100 text-cyan-800 border border-cyan-200',
    secondary: 'bg-slate-100 text-slate-800 border border-slate-200',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
    >
      {children}
    </span>
  );
};

export default Badge;

