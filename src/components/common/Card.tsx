import React from 'react';
import Button from './Button';

/**
 * Card Component Props
 */
interface CardProps {
  /**
   * Card content
   */
  children: React.ReactNode;
  /**
   * Card title (displayed in header)
   */
  title?: string;
  /**
   * Card subtitle (displayed below title)
   */
  subtitle?: string;
  /**
   * Action button configuration
   */
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  /**
   * Click handler for the entire card (makes card clickable)
   */
  onClick?: () => void;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Enable hover effect (lift + shadow increase)
   * @default false
   */
  hover?: boolean;
}

/**
 * Card Component
 * 
 * A versatile card component with optional header, action buttons, and hover effects.
 * 
 * Features:
 * - White background with shadow
 * - Rounded corners
 * - Optional header with title, subtitle, and action button
 * - Optional hover effect (lift + shadow increase)
 * - Responsive padding
 * - Clean spacing
 * 
 * @example
 * ```tsx
 * // Basic card
 * <Card title="Player Stats">
 *   <p>Content here</p>
 * </Card>
 * 
 * // Card with action button
 * <Card
 *   title="Team Overview"
 *   subtitle="Manage your team"
 *   action={{ label: 'Edit', onClick: handleEdit }}
 *   hover
 * >
 *   <p>Team content</p>
 * </Card>
 * ```
 */
const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  onClick,
  className = '',
  hover = false,
}) => {
  const baseStyles = `
    bg-white
    rounded-xl
    border
    border-gray-200
    shadow-lg
    p-6
    sm:p-8
    transition-all
    duration-300
    ${hover ? 'hover:shadow-2xl hover:-translate-y-1' : ''}
    ${onClick ? 'cursor-pointer' : ''}
  `;

  return (
    <div 
      className={`${baseStyles} ${className}`.replace(/\s+/g, ' ').trim()}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {/* Header Section */}
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            {title && (
              <h3 className="text-xl font-semibold text-gray-900 mb-1">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
          {action && (
            <Button
              variant={action.variant || 'outline'}
              size="sm"
              onClick={action.onClick}
              className="ml-4"
            >
              {action.label}
            </Button>
          )}
        </div>
      )}

      {/* Card Content */}
      <div className={title || subtitle || action ? '' : ''}>
        {children}
      </div>
    </div>
  );
};

export default Card;
