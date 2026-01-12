import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

/**
 * Breadcrumb Item Type Definition
 */
export interface BreadcrumbItem {
  /**
   * Display label for the breadcrumb item
   */
  label: string;
  /**
   * Route path (if provided, item is clickable)
   * If not provided, item is non-clickable (current page)
   */
  path?: string;
}

/**
 * Breadcrumb Component Props
 */
export interface BreadcrumbProps {
  /**
   * Array of breadcrumb items
   * Last item should not have a path (represents current page)
   * 
   * @example
   * ```tsx
   * <Breadcrumb items={[
   *   { label: 'Home', path: '/' },
   *   { label: 'Admin', path: '/admin' },
   *   { label: 'Players' } // Current page, no path
   * ]} />
   * ```
   */
  items: BreadcrumbItem[];
  /**
   * Show home icon as first breadcrumb item
   * @default true
   */
  showHome?: boolean;
  /**
   * Home path (used when showHome is true)
   * @default '/'
   */
  homePath?: string;
  /**
   * Custom className for the breadcrumb container
   */
  className?: string;
}

/**
 * Breadcrumb Component
 * 
 * A beautiful breadcrumb navigation component that shows the current page path
 * and allows users to navigate to parent pages.
 * 
 * Features:
 * - Clickable links for navigation (except current page)
 * - Chevron right separators between items
 * - Optional home icon as first item
 * - Responsive design (mobile-friendly)
 * - Smooth hover effects
 * - Truncation for long paths on mobile
 * 
 * USAGE:
 * ```tsx
 * // Basic breadcrumb
 * <Breadcrumb items={[
 *   { label: 'Admin', path: '/admin' },
 *   { label: 'Players' }
 * ]} />
 * 
 * // With home icon
 * <Breadcrumb
 *   showHome={true}
 *   items={[
 *     { label: 'Admin', path: '/admin' },
 *     { label: 'Players', path: '/admin/players' },
 *     { label: 'Edit Player' }
 *   ]}
 * />
 * 
 * // Auto-generate from current location
 * const location = useLocation();
 * const items = generateBreadcrumbFromPath(location.pathname);
 * <Breadcrumb items={items} />
 * ```
 */
const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  showHome = true,
  homePath = '/',
  className = '',
}) => {
  const location = useLocation();

  // Ensure items array is not empty
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav
      className={`flex items-center space-x-1 text-sm text-gray-600 ${className}`}
      aria-label="Breadcrumb"
    >
      {/* Home Icon (Optional) */}
      {showHome && (
        <>
          <Link
            to={homePath}
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-150"
            aria-label="Home"
          >
            <HomeIcon className="w-4 h-4" aria-hidden="true" />
          </Link>
          <ChevronRightIcon className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
        </>
      )}

      {/* Breadcrumb Items */}
      <ol className="flex items-center space-x-1 overflow-x-auto" role="list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isActive = item.path === location.pathname || (!item.path && isLast);

          return (
            <li key={index} className="flex items-center">
              {item.path && !isLast ? (
                // Clickable breadcrumb item
                <>
                  <Link
                    to={item.path}
                    className="text-gray-500 hover:text-gray-700 transition-colors duration-150 truncate max-w-[150px] sm:max-w-none"
                  >
                    {item.label}
                  </Link>
                  <ChevronRightIcon
                    className="w-4 h-4 text-gray-400 flex-shrink-0 mx-1"
                    aria-hidden="true"
                  />
                </>
              ) : (
                // Current page (non-clickable)
                <>
                  <span
                    className={`font-medium truncate max-w-[150px] sm:max-w-none ${
                      isActive ? 'text-gray-900' : 'text-gray-600'
                    }`}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                  {!isLast && (
                    <ChevronRightIcon
                      className="w-4 h-4 text-gray-400 flex-shrink-0 mx-1"
                      aria-hidden="true"
                    />
                  )}
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;

/**
 * Helper: Generate Breadcrumb from Pathname
 * 
 * Automatically generates breadcrumb items from a given pathname.
 * Useful for dynamic breadcrumb generation based on route.
 * 
 * @param pathname - Current pathname (e.g., '/admin/players/edit')
 * @returns Array of breadcrumb items
 * 
 * @example
 * ```ts
 * const location = useLocation();
 * const breadcrumbs = generateBreadcrumbFromPath(location.pathname);
 * // For '/admin/players/edit', returns:
 * // [
 * //   { label: 'Admin', path: '/admin' },
 * //   { label: 'Players', path: '/admin/players' },
 * //   { label: 'Edit' }
 * // ]
 * ```
 */
export const generateBreadcrumbFromPath = (pathname: string): BreadcrumbItem[] => {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbItems: BreadcrumbItem[] = [];

  segments.forEach((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/');
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

    // Last segment is current page (no path)
    if (index === segments.length - 1) {
      breadcrumbItems.push({ label });
    } else {
      breadcrumbItems.push({ label, path });
    }
  });

  return breadcrumbItems;
};

/**
 * Helper: Generate Breadcrumb from Navigation Config
 * 
 * Generates breadcrumb items from navigation configuration based on current path.
 * This provides more meaningful labels than auto-generated ones.
 * 
 * @param pathname - Current pathname
 * @param navigationSections - Navigation sections from getNavigationForRole()
 * @returns Array of breadcrumb items
 * 
 * @example
 * ```ts
 * const { user } = useAuth();
 * const navSections = getNavigationForRole(user?.role);
 * const breadcrumbs = generateBreadcrumbFromNav(pathname, navSections);
 * ```
 */
export const generateBreadcrumbFromNav = (
  pathname: string,
  navigationSections: Array<{ items: Array<{ name: string; path: string }> }>
): BreadcrumbItem[] => {
  const breadcrumbItems: BreadcrumbItem[] = [];
  const segments = pathname.split('/').filter(Boolean);

  // Build path incrementally and find matching nav items
  segments.forEach((segment, index) => {
    const currentPath = '/' + segments.slice(0, index + 1).join('/');
    const isLast = index === segments.length - 1;

    // Try to find matching navigation item
    let foundItem: { name: string; path: string } | undefined;
    for (const section of navigationSections) {
      foundItem = section.items.find((item) => item.path === currentPath);
      if (foundItem) break;
    }

    if (foundItem) {
      if (isLast) {
        breadcrumbItems.push({ label: foundItem.name });
      } else {
        breadcrumbItems.push({ label: foundItem.name, path: foundItem.path });
      }
    } else {
      // Fallback to auto-generated label
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      if (isLast) {
        breadcrumbItems.push({ label });
      } else {
        breadcrumbItems.push({ label, path: currentPath });
      }
    }
  });

  return breadcrumbItems;
};

