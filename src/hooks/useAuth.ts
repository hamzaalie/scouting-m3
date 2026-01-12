/**
 * useAuth Hook
 * Provides easy access to authentication context
 * 
 * This is a re-export of the useAuth hook from AuthContext
 * to maintain compatibility and provide a cleaner import path
 * 
 * @example
 * ```tsx
 * import { useAuth } from '../hooks/useAuth';
 * 
 * const MyComponent = () => {
 *   const { user, login, logout, isAuthenticated } = useAuth();
 *   // ...
 * };
 * ```
 */

export { useAuth } from '../context/AuthContext';
