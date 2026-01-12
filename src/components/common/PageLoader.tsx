import React from 'react';

/**
 * PageLoader Component Props
 */
interface PageLoaderProps {
  /**
   * Optional custom loading message
   * @default 'Loading...'
   */
  message?: string;
  /**
   * Show app logo
   * @default true
   */
  showLogo?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * PageLoader Component
 * 
 * Full-page loading component with centered spinner, logo, and loading text.
 * Used for initial app load, authentication checks, and page transitions.
 * 
 * Features:
 * - Centered spinner with smooth animation
 * - App logo display
 * - Loading message
 * - Smooth fade-in animation
 * - Full screen overlay
 * - Professional styling
 * 
 * @example
 * ```tsx
 * // Basic page loader
 * <PageLoader />
 * 
 * // Custom message
 * <PageLoader message="Checking authentication..." />
 * 
 * // Without logo
 * <PageLoader showLogo={false} message="Please wait..." />
 * ```
 */
const PageLoader: React.FC<PageLoaderProps> = ({
  message = 'Loading...',
  showLogo = true,
  className = '',
}) => {
  return (
    <div
      className={`
        fixed
        inset-0
        flex
        flex-col
        items-center
        justify-center
        bg-white
        z-50
        animate-fade-in
        ${className}
      `.replace(/\s+/g, ' ').trim()}
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      {/* Logo */}
      {showLogo && (
        <div className="mb-6 animate-scale-up">
          <div className="h-20 w-20 rounded-2xl bg-white flex items-center justify-center shadow-lg p-3">
            <img src="/LOGO.png" alt="iDA - Football Scouting Platform" className="h-full w-full object-contain" />
          </div>
        </div>
      )}

      {/* Spinner */}
      <div className="mb-4">
        <div
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"
          role="status"
          aria-label="Loading spinner"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>

      {/* Loading Message */}
      <p className="text-sm font-medium text-gray-600 animate-pulse">{message}</p>

      {/* Fade-in animation (if not already in Tailwind config) */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scale-up {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-up {
          animation: scale-up 0.3s ease-out 0.1s both;
        }
      `}</style>
    </div>
  );
};

export default PageLoader;

