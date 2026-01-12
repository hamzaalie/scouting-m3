import React from 'react';

interface LoadingSpinnerProps {
  /**
   * Size of the spinner
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Spinner color (Tailwind color class)
   * @default 'blue-600'
   */
  color?: string;
  /**
   * Optional text to display below spinner
   */
  text?: string;
  /**
   * Custom className for additional styling
   */
  className?: string;
  /**
   * Whether to show full screen overlay
   * @default false
   */
  fullScreen?: boolean;
}

/**
 * Loading Spinner Component
 * 
 * Beautiful animated spinner for loading states with customizable size and color.
 * 
 * Features:
 * - Smooth spinning animation
 * - Multiple sizes
 * - Customizable color
 * - Optional text display
 * - Full screen overlay option
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * // Basic spinner
 * <LoadingSpinner />
 * 
 * // Large spinner with text
 * <LoadingSpinner size="lg" text="Loading..." />
 * 
 * // Custom color
 * <LoadingSpinner color="green-600" />
 * 
 * // Full screen overlay
 * <LoadingSpinner fullScreen text="Please wait..." />
 * ```
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'blue-600',
  text,
  className = '',
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-3',
    lg: 'w-16 h-16 border-4',
  };

  // Get color class (using full class names for Tailwind)
  const getColorClass = () => {
    const colorMap: Record<string, string> = {
      'blue-600': 'border-blue-600',
      'green-600': 'border-green-600',
      'red-600': 'border-red-600',
      'purple-600': 'border-purple-600',
      'gray-600': 'border-gray-600',
      'amber-600': 'border-amber-600',
    };
    return colorMap[color] || 'border-blue-600';
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} ${getColorClass()} border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
      {text && (
        <p className="mt-4 text-sm font-medium text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
