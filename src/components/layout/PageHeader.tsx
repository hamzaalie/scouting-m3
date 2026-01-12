import React from 'react';
import Button from '../common/Button';

/**
 * PageHeader Component Props
 */
export interface PageHeaderProps {
  /**
   * Main page title
   */
  title: string;
  /**
   * Optional subtitle or description
   */
  subtitle?: string;
  /**
   * Optional breadcrumb items
   */
  breadcrumbs?: Array<{
    label: string;
    path?: string;
  }>;
  /**
   * Action button configuration (displayed on the right)
   */
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    icon?: React.ReactNode;
    loading?: boolean;
  };
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * PageHeader Component
 * 
 * A beautiful page header component with title, subtitle, breadcrumbs, and actions.
 * 
 * Features:
 * - Large, prominent title
 * - Optional subtitle/breadcrumb
 * - Action button on the right
 * - Bottom border/shadow
 * - Responsive design
 * - Smooth transitions
 * 
 * @example
 * ```tsx
 * // Basic header
 * <PageHeader title="Admin Dashboard" />
 * 
 * // With subtitle and action
 * <PageHeader
 *   title="Player Management"
 *   subtitle="Manage all players in your organization"
 *   action={{
 *     label: "Add Player",
 *     onClick: handleAddPlayer,
 *     variant: "primary",
 *   }}
 * />
 * 
 * // With breadcrumbs
 * <PageHeader
 *   title="Edit Player"
 *   breadcrumbs={[
 *     { label: "Players", path: "/players" },
 *     { label: "John Doe" },
 *   ]}
 * />
 * ```
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  action,
  className = '',
}) => {
  return (
    <div className={`border-b border-gray-200 bg-white pb-3 mb-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Left Section: Breadcrumbs, Title, Subtitle */}
        <div className="flex-1 min-w-0">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-1.5" aria-label="Breadcrumb">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                  {crumb.path ? (
                    <a
                      href={crumb.path}
                      className="hover:text-gray-700 transition-colors"
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-gray-900 font-medium">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="mt-1 text-sm text-gray-600 max-w-2xl">{subtitle}</p>
          )}
        </div>

        {/* Right Section: Action Button */}
        {action && (
          <div className="flex-shrink-0">
            <Button
              variant={action.variant || 'primary'}
              onClick={action.onClick}
              icon={action.icon}
              loading={action.loading}
            >
              {action.label}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;

