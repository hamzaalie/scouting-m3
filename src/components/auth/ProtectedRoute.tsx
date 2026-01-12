import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import PageLoader from '../common/PageLoader';
import { isTokenExpired } from '../../utils/helpers';

/**
 * ProtectedRoute Component Props
 */
interface ProtectedRouteProps {
  /**
   * Child components to render if user is authenticated and authorized
   */
  children: React.ReactNode;
  /**
   * Array of allowed roles (e.g., ['admin', 'scout'])
   * If undefined, any authenticated user can access
   * 
   * @example
   * // Allow only admin
   * roles={['admin']}
   * 
   * // Allow admin or scout
   * roles={['admin', 'scout']}
   */
  allowedRoles?: ('admin' | 'player' | 'scout')[];
  /**
   * Optional redirect path for unauthenticated users
   * @default '/login'
   */
  redirectTo?: string;
}

/**
 * Protected Route Component
 * 
 * Enhanced route protection with authentication, role-based authorization, and security features.
 * 
 * Security Features:
 * - ✅ Authentication check (redirects to /login if not authenticated)
 * - ✅ Role-based authorization (redirects to /403 if wrong role)
 * - ✅ Support for multiple allowed roles
 * - ✅ Preserves intended destination URL (redirects back after login)
 * - ✅ Handles token expiration gracefully
 * - ✅ Loading state while checking authentication
 * - ✅ Full-page loader during auth checks
 * 
 * Flow:
 * 1. On mount, checks authentication status
 * 2. Shows PageLoader while checking
 * 3. If not authenticated → Redirect to /login with return URL
 * 4. If authenticated but token expired → Redirect to /login
 * 5. If authenticated but wrong role → Redirect to /403
 * 6. If authenticated and authorized → Render children
 * 
 * @example
 * ```tsx
 * // Require authentication only (any role)
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 * 
 * // Require admin role only
 * <ProtectedRoute allowedRoles={['admin']}>
 *   <AdminPanel />
 * </ProtectedRoute>
 * 
 * // Require multiple roles (admin OR scout)
 * <ProtectedRoute allowedRoles={['admin', 'scout']}>
 *   <ManagementPanel />
 * </ProtectedRoute>
 * ```
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo = '/login',
}) => {
  const { user, isAuthenticated, loading, checkAuth } = useAuth();
  const location = useLocation();

  /**
   * Check authentication on mount
   * This ensures the auth state is up-to-date when navigating
   */
  useEffect(() => {
    // Only check if we don't have user data yet
    if (!user && !loading) {
      checkAuth().catch((error) => {
        console.error('Auth check failed:', error);
      });
    }
  }, [user, loading, checkAuth]);

  /**
   * Show PageLoader while checking authentication
   * This provides better UX than a blank screen
   */
  if (loading && !user) {
    return <PageLoader message="Checking authentication..." />;
  }

  /**
   * SECURITY CHECK 1: Authentication
   * 
   * If user is not authenticated, redirect to login.
   * Preserve the intended destination in location.state so we can
   * redirect back after successful login.
   */
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to={redirectTo}
        state={{
          from: location, // Preserve intended destination
          message: 'Please log in to access this page.',
        }}
        replace
      />
    );
  }

  /**
   * SECURITY CHECK 2: Token Expiration
   * 
   * Even if user object exists, check if token is still valid.
   * If token expired, redirect to login.
   */
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token && isTokenExpired(token)) {
      // Clear expired tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');

      return (
        <Navigate
          to={redirectTo}
          state={{
            from: location,
            message: 'Your session has expired. Please log in again.',
          }}
          replace
        />
      );
    }
  }

  /**
   * SECURITY CHECK 3: Role Authorization
   * 
   * If allowedRoles is specified, check if user has one of the required roles.
   * If user doesn't have required role, redirect to /403 (Access Denied).
   */
  if (allowedRoles && allowedRoles.length > 0) {
    // Map Central Backend roles to M3 roles
    const roleMapping: Record<string, 'admin' | 'player' | 'scout'> = {
      'super_admin': 'admin',
      'support_admin': 'admin',
      'read_only_admin': 'admin',
      'subscriber': 'scout',
      'limited_user': 'scout',
      'admin': 'admin',
      'player': 'player',
      'scout': 'scout',
    };
    
    const mappedRole = roleMapping[user.role] || user.role;
    const hasRequiredRole = allowedRoles.includes(mappedRole as any);

    if (!hasRequiredRole) {
      /**
       * User is authenticated but doesn't have required role(s).
       * Redirect to /403 with context information.
       */
      return (
        <Navigate
          to="/403"
          state={{
            requiredRoles: allowedRoles,
            userRole: user.role,
            from: location.pathname,
          }}
          replace
        />
      );
    }
  }

  /**
   * SECURITY CHECK PASSED
   * 
   * User is authenticated, token is valid, and has required role (if specified).
   * Render the protected content.
   */
  return <>{children}</>;
};

export default ProtectedRoute;

