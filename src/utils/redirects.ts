/**
 * Redirect Utility Functions
 * 
 * Centralized redirect logic for navigation based on user roles and application state.
 */

/**
 * User Role Type
 */
export type UserRole = 'admin' | 'player' | 'scout';

/**
 * Get Dashboard Path for User Role
 * 
 * Returns the appropriate dashboard path based on the user's role.
 * Used for redirecting users after login or from error pages.
 * 
 * @param role - User role ('admin', 'player', or 'scout')
 * @returns Dashboard path string
 * 
 * @example
 * ```ts
 * // Admin user
 * getDashboardPath('admin') // Returns '/admin'
 * 
 * // Player user
 * getDashboardPath('player') // Returns '/player'
 * 
 * // Scout user
 * getDashboardPath('scout') // Returns '/scout'
 * 
 * // Invalid role
 * getDashboardPath('invalid' as any) // Returns '/login'
 * ```
 */
export const getDashboardPath = (role?: UserRole | string): string => {
  switch (role) {
    case 'admin':
    case 'super_admin':
    case 'support_admin':
    case 'read_only_admin':
      return '/admin/dashboard';
    case 'player':
      return '/player/dashboard';
    case 'scout':
    case 'subscriber':
    case 'limited_user':
      return '/scout/dashboard';
    default:
      // Fallback to login if role is invalid or undefined
      return '/login';
  }
};

/**
 * Get Login Path
 * 
 * @returns Login page path
 */
export const getLoginPath = (): string => {
  return '/login';
};

/**
 * Get Register Path
 * 
 * @returns Register page path
 */
export const getRegisterPath = (): string => {
  return '/register';
};

/**
 * Check if path requires authentication
 * 
 * @param pathname - Current pathname
 * @returns true if path requires authentication
 */
export const requiresAuth = (pathname: string): boolean => {
  // Public paths that don't require authentication
  const publicPaths = ['/login', '/register', '/forgot-password', '/403', '/404', '/500'];
  
  // Check if path is public
  if (publicPaths.includes(pathname)) {
    return false;
  }
  
  // Root path doesn't require auth (it redirects)
  if (pathname === '/') {
    return false;
  }
  
  // All other paths require authentication
  return true;
};

/**
 * Check if path is an error page
 * 
 * @param pathname - Current pathname
 * @returns true if path is an error page
 */
export const isErrorPage = (pathname: string): boolean => {
  return ['/403', '/404', '/500'].includes(pathname);
};

