import React from 'react';

/**
 * Pagination Component Props
 */
export interface PaginationProps {
  /**
   * Current active page (1-based)
   */
  currentPage: number;
  /**
   * Total number of pages
   */
  totalPages: number;
  /**
   * Callback when page changes
   * @param page - The new page number (1-based)
   */
  onPageChange: (page: number) => void;
  /**
   * Maximum number of page buttons to show (excluding prev/next)
   * @default 7
   */
  maxVisiblePages?: number;
  /**
   * Show previous/next buttons
   * @default true
   */
  showPrevNext?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Pagination Component
 * 
 * A beautiful pagination component with page numbers and ellipsis support.
 * 
 * Features:
 * - Page number buttons
 * - Previous/Next navigation
 * - Ellipsis for many pages
 * - Active page highlighting
 * - Disabled states for edges
 * - Responsive design
 * 
 * @example
 * ```tsx
 * // Basic pagination
 * <Pagination
 *   currentPage={1}
 *   totalPages={10}
 *   onPageChange={(page) => setCurrentPage(page)}
 * />
 * 
 * // With custom max visible pages
 * <Pagination
 *   currentPage={5}
 *   totalPages={20}
 *   onPageChange={handlePageChange}
 *   maxVisiblePages={5}
 * />
 * 
 * // Without prev/next buttons
 * <Pagination
 *   currentPage={3}
 *   totalPages={5}
 *   onPageChange={handlePageChange}
 *   showPrevNext={false}
 * />
 * ```
 */
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 7,
  showPrevNext = true,
  className = '',
}) => {
  // Don't render if there's only one page or less
  if (totalPages <= 1) {
    return null;
  }

  /**
   * Generate array of page numbers to display
   * Includes ellipsis logic for many pages
   */
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Calculate which pages to show
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(1, currentPage - halfVisible);
      let endPage = Math.min(totalPages, currentPage + halfVisible);

      // Adjust if we're near the beginning
      if (currentPage <= halfVisible) {
        startPage = 1;
        endPage = maxVisiblePages;
      }

      // Adjust if we're near the end
      if (currentPage >= totalPages - halfVisible) {
        startPage = totalPages - maxVisiblePages + 1;
        endPage = totalPages;
      }

      // Add first page and ellipsis if needed
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('ellipsis');
        }
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis and last page if needed
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('ellipsis');
        }
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePageClick = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <nav
      className={`flex items-center justify-center gap-1 ${className}`}
      aria-label="Pagination"
    >
      {/* Previous Button */}
      {showPrevNext && (
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`
            px-3 py-2
            text-sm font-medium
            rounded-lg
            transition-colors
            duration-150
            ${
              currentPage === 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }
            disabled:opacity-50
          `}
          aria-label="Previous page"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-gray-500"
              >
                ...
              </span>
            );
          }

          const isActive = page === currentPage;

          return (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              className={`
                min-w-[2.5rem]
                px-3 py-2
                text-sm font-medium
                rounded-lg
                transition-all
                duration-150
                ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
              aria-label={`Page ${page}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      {showPrevNext && (
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`
            px-3 py-2
            text-sm font-medium
            rounded-lg
            transition-colors
            duration-150
            ${
              currentPage === totalPages
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }
            disabled:opacity-50
          `}
          aria-label="Next page"
        >
          <svg
            className="w-5 h-5"
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
        </button>
      )}
    </nav>
  );
};

export default Pagination;

