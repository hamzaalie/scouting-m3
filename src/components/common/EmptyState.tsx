import React from 'react';
import Button from './Button';

/**
 * EmptyState Component Props
 */
export interface EmptyStateProps {
  /**
   * Icon to display (React node or SVG)
   */
  icon?: React.ReactNode;
  /**
   * Title text
   */
  title: string;
  /**
   * Description message
   */
  message?: string;
  /**
   * Action button configuration
   */
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * EmptyState Component
 * 
 * A beautiful component for displaying empty states (no data, no results, etc.).
 * 
 * Features:
 * - Large centered icon
 * - Title and descriptive message
 * - Optional action button
 * - Clean, centered layout
 * - Responsive design
 * 
 * @example
 * ```tsx
 * // Basic empty state
 * <EmptyState
 *   title="No matches found"
 *   message="There are no matches to display at this time."
 * />
 * 
 * // With icon and action
 * <EmptyState
 *   icon={<SearchIcon />}
 *   title="No results found"
 *   message="Try adjusting your search criteria."
 *   action={{
 *     label: "Clear Filters",
 *     onClick: handleClearFilters,
 *     variant: "primary"
 *   }}
 * />
 * 
 * // For empty player list
 * <EmptyState
 *   title="No players yet"
 *   message="Get started by adding your first player."
 *   action={{
 *     label: "Add Player",
 *     onClick: handleAddPlayer
 *   }}
 * />
 * ```
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  action,
  className = '',
}) => {
  // Default icon if none provided
  const DefaultIcon = (
    <svg
      className="w-24 h-24 text-gray-300"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
  );

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {/* Icon */}
      <div className="mb-4 flex justify-center">
        {icon || DefaultIcon}
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>

      {/* Message */}
      {message && (
        <p className="text-gray-500 max-w-md mb-6">{message}</p>
      )}

      {/* Action Button */}
      {action && (
        <Button
          variant={action.variant || 'primary'}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;

