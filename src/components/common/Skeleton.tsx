import React from 'react';

/**
 * Skeleton Component Props
 */
interface SkeletonProps {
  /**
   * Width of the skeleton (e.g., 'w-32', 'w-full', '100px')
   * @default 'w-full'
   */
  width?: string;
  /**
   * Height of the skeleton (e.g., 'h-4', 'h-8', '40px')
   * @default 'h-4'
   */
  height?: string;
  /**
   * Number of skeleton lines to render
   * @default 1
   */
  count?: number;
  /**
   * Make skeleton circular (useful for avatars)
   * @default false
   */
  circle?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Skeleton Component
 * 
 * A loading placeholder component with shimmer animation.
 * 
 * Features:
 * - Shimmer animation effect
 * - Customizable width and height
 * - Multiple skeleton lines support
 * - Circular variant for avatars
 * - Smooth animation
 * 
 * @example
 * ```tsx
 * // Basic skeleton
 * <Skeleton />
 * 
 * // Custom size
 * <Skeleton width="w-64" height="h-8" />
 * 
 * // Multiple lines
 * <Skeleton count={3} height="h-4" />
 * 
 * // Circular (for avatars)
 * <Skeleton circle width="w-12" height="h-12" />
 * 
 * // Card skeleton
 * <div className="space-y-4">
 *   <Skeleton width="w-3/4" height="h-6" />
 *   <Skeleton count={3} height="h-4" />
 * </div>
 * ```
 */
const Skeleton: React.FC<SkeletonProps> = ({
  width = 'w-full',
  height = 'h-4',
  count = 1,
  circle = false,
  className = '',
}) => {
  const shimmerStyles = `
    bg-gradient-to-r
    from-gray-200
    via-gray-100
    to-gray-200
    bg-[length:1000px_100%]
    animate-shimmer
    ${circle ? 'rounded-full' : 'rounded'}
    ${width}
    ${height}
    ${className}
  `;

  if (count === 1) {
    return (
      <div
        className={shimmerStyles.replace(/\s+/g, ' ').trim()}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2" role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={shimmerStyles.replace(/\s+/g, ' ').trim()}
        >
          <span className="sr-only">Loading...</span>
        </div>
      ))}
    </div>
  );
};

export default Skeleton;

