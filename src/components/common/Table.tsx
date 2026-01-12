import React, { useState, useMemo } from 'react';
import Skeleton from './Skeleton';
import EmptyState from './EmptyState';
import Pagination from './Pagination';

/**
 * Table Column Definition
 */
export interface TableColumn<T = any> {
  /**
   * Unique key for the column
   */
  key: string;
  /**
   * Column header label
   */
  label: string;
  /**
   * Function to extract value from row data
   * @param row - The row data object
   * @returns The value to display
   */
  render?: (row: T) => React.ReactNode;
  /**
   * Whether the column is sortable
   * @default false
   */
  sortable?: boolean;
  /**
   * Custom sort function
   * @param a - First row
   * @param b - Second row
   * @returns Sort comparison result
   */
  sortFn?: (a: T, b: T) => number;
  /**
   * Column alignment
   * @default 'left'
   */
  align?: 'left' | 'center' | 'right';
  /**
   * Column width (CSS class or style)
   */
  width?: string;
}

/**
 * Table Component Props
 */
export interface TableProps<T = any> {
  /**
   * Column definitions
   */
  columns: TableColumn<T>[];
  /**
   * Array of row data objects
   */
  data: T[];
  /**
   * Callback when a row is clicked
   * @param row - The clicked row data
   * @param index - The row index
   */
  onRowClick?: (row: T, index: number) => void;
  /**
   * Whether the table is in loading state
   * @default false
   */
  loading?: boolean;
  /**
   * Enable striped rows (alternating background colors)
   * @default false
   */
  striped?: boolean;
  /**
   * Enable hover effect on rows
   * @default true
   */
  hover?: boolean;
  /**
   * Empty state configuration (shown when data is empty and not loading)
   */
  emptyState?: {
    icon?: React.ReactNode;
    title: string;
    message?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  /**
   * Pagination configuration
   */
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  /**
   * Number of skeleton rows to show when loading
   * @default 5
   */
  skeletonRows?: number;
  /**
   * Additional CSS classes for the table container
   */
  className?: string;
  /**
   * Row key extractor function (for React keys)
   * @default Uses array index
   */
  rowKey?: (row: T, index: number) => string | number;
}

/**
 * Sort direction type
 */
type SortDirection = 'asc' | 'desc' | null;

/**
 * Table Component
 * 
 * A beautiful, feature-rich table component for displaying data.
 * 
 * Features:
 * - Responsive design (scrollable on mobile)
 * - Sortable columns with icons
 * - Striped rows option
 * - Hover effects on rows
 * - Loading skeleton state
 * - Empty state support
 * - Pagination integration
 * - Custom cell rendering
 * - Row click handlers
 * 
 * @example
 * ```tsx
 * // Basic table
 * const columns: TableColumn<Player>[] = [
 *   { key: 'name', label: 'Name', sortable: true },
 *   { key: 'position', label: 'Position' },
 *   { key: 'goals', label: 'Goals', sortable: true, align: 'right' },
 * ];
 * 
 * <Table
 *   columns={columns}
 *   data={players}
 *   onRowClick={(player) => navigate(`/players/${player.id}`)}
 * />
 * 
 * // With custom rendering
 * const columns: TableColumn<Match>[] = [
 *   {
 *     key: 'teams',
 *     label: 'Match',
 *     render: (match) => (
 *       <div>
 *         <span>{match.homeTeam} vs {match.awayTeam}</span>
 *       </div>
 *     ),
 *   },
 *   { key: 'date', label: 'Date', sortable: true },
 * ];
 * 
 * <Table
 *   columns={columns}
 *   data={matches}
 *   striped
 *   loading={isLoading}
 *   emptyState={{
 *     title: 'No matches found',
 *     message: 'There are no matches to display.',
 *   }}
 *   pagination={{
 *     currentPage: 1,
 *     totalPages: 10,
 *     onPageChange: handlePageChange,
 *   }}
 * />
 * ```
 */
function Table<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  loading = false,
  striped = false,
  hover = true,
  emptyState,
  pagination,
  skeletonRows = 5,
  className = '',
  rowKey,
}: TableProps<T>): React.JSX.Element {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  /**
   * Handle column header click for sorting
   */
  const handleSort = (column: TableColumn<T>) => {
    if (!column.sortable) return;

    if (sortColumn === column.key) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(column.key);
      setSortDirection('asc');
    }
  };

  /**
   * Sort data based on current sort column and direction
   */
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) {
      return data;
    }

    const column = columns.find((col) => col.key === sortColumn);
    if (!column || !column.sortable) {
      return data;
    }

    const sorted = [...data].sort((a, b) => {
      // Use custom sort function if provided
      if (column.sortFn) {
        return column.sortFn(a, b);
      }

      // Default sorting: compare values
      const aValue = column.render ? column.render(a) : a[column.key];
      const bValue = column.render ? column.render(b) : b[column.key];

      // Handle null/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Compare values
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return aValue - bValue;
      }

      // String comparison
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      if (aStr < bStr) return -1;
      if (aStr > bStr) return 1;
      return 0;
    });

    // Reverse if descending
    return sortDirection === 'desc' ? sorted.reverse() : sorted;
  }, [data, sortColumn, sortDirection, columns]);

  /**
   * Get sort icon for column
   */
  const getSortIcon = (column: TableColumn<T>) => {
    if (!column.sortable) return null;

    if (sortColumn !== column.key) {
      return (
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
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }

    if (sortDirection === 'asc') {
      return (
        <svg
          className="w-4 h-4 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      );
    }

    return (
      <svg
        className="w-4 h-4 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );
  };

  /**
   * Render loading skeleton
   */
  if (loading) {
    return (
      <div className={`overflow-x-auto ${className}`}>
        <div className="shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`
                      px-6 py-3
                      text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                      ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : ''}
                      ${column.width ? column.width : ''}
                    `}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.from({ length: skeletonRows }).map((_, index) => (
                <tr 
                  key={index}
                  className="table-row-animate"
                  style={{ 
                    animationDelay: `${index * 50}ms`, 
                    animationFillMode: 'both',
                    opacity: 0,
                    transform: 'translateY(10px)'
                  }}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`
                        px-6 py-4 whitespace-nowrap
                        ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : ''}
                      `}
                    >
                      <Skeleton height="h-4" width="w-24" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  /**
   * Render empty state
   */
  if (!loading && sortedData.length === 0) {
    if (emptyState) {
      return (
        <EmptyState
          icon={emptyState.icon}
          title={emptyState.title}
          message={emptyState.message}
          action={emptyState.action}
          className={className}
        />
      );
    }
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Table Container - Scrollable on mobile */}
      <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table Header */}
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => handleSort(column)}
                  className={`
                    px-6 py-3
                    text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                    ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : ''}
                    ${column.sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''}
                    transition-colors duration-150
                    ${column.width ? column.width : ''}
                  `}
                >
                  <div className={`flex items-center gap-2 ${column.align === 'right' ? 'justify-end' : column.align === 'center' ? 'justify-center' : ''}`}>
                    <span>{column.label}</span>
                    {getSortIcon(column)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className={`bg-white divide-y divide-gray-200 ${striped ? 'divide-y-0' : ''}`}>
            {sortedData.map((row, index) => {
              const key = rowKey ? rowKey(row, index) : index;
              return (
                <tr
                  key={key}
                  onClick={() => onRowClick?.(row, index)}
                  className={`
                    ${striped && index % 2 === 0 ? 'bg-gray-50' : ''}
                    ${hover ? 'hover:bg-gray-50' : ''}
                    ${onRowClick ? 'cursor-pointer' : ''}
                    transition-all duration-200
                    table-row-animate
                  `}
                  style={{ 
                    animationDelay: `${index * 50}ms`, 
                    animationFillMode: 'both',
                    opacity: 0,
                    transform: 'translateY(10px)'
                  }}
                >
                  {columns.map((column) => {
                    const value = column.render ? column.render(row) : row[column.key];
                    return (
                      <td
                        key={column.key}
                        className={`
                          px-6 py-4 whitespace-nowrap text-sm text-gray-900
                          ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : ''}
                        `}
                      >
                        {value ?? <span className="text-gray-400">—</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}

      {/* Animation styles */}
      <style>{`
        @keyframes tableRowFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .table-row-animate {
          animation: tableRowFadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default Table;

