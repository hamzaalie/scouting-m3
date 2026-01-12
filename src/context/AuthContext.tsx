import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getCurrentUser,
  updateProfile as apiUpdateProfile,
  isAuthenticated,
  removeTokens,
} from '../services/authService';
import { STORAGE_KEYS } from '../utils/constants';
import { getDashboardPath } from '../utils/redirects';
import type { User, RegisterData } from '../services/authService';

/**
 * Auth Context Type Definition
 * Provides global authentication state and functions throughout the app
 */
interface AuthContextType {
  // State
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<{ user: User; access: string; refresh: string }>;
  register: (userData: RegisterData) => Promise<{ message: string; email: string }>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  
  // Navigation
  redirectToDashboard: () => void;
}

/**
 * Create Auth Context
 * Will be undefined if used outside AuthProvider
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Component
 * Manages global authentication state and provides auth functions to all children
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Try to load user from localStorage on initial mount to avoid delay
  const normalizeRole = (role: string | undefined): 'admin' | 'player' | 'scout' => {
    if (!role) return 'player';
    if (role === 'subscriber' || role === 'limited_user') return 'scout';
    if (role === 'super_admin' || role === 'support_admin' || role === 'read_only_admin') return 'admin';
    if (role === 'admin' || role === 'player' || role === 'scout') return role;
    return 'player';
  };

  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        return { ...parsed, role: normalizeRole(parsed.role) };
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check if user is authenticated and load user data
   * Called on app mount and after login/register
   */
  const checkAuth = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Check if token exists and is valid
      if (!isAuthenticated()) {
        setUser(null);
        setLoading(false);
        return;
      }

      // If we already have user data, skip API call on initial check
      // This prevents unnecessary delay after login
      if (user && isAuthenticated()) {
        setLoading(false);
        return;
      }

      // Fetch current user from API only if we don't have user data
      const userData = await getCurrentUser();
      setUser(userData ? { ...userData, role: normalizeRole(userData.role) } : null);
    } catch (err) {
      // Token might be invalid or expired
      console.error('Auth check failed:', err);
      removeTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login user with email and password
   * @param email - User email address
   * @param password - User password
   * @returns Auth response with user and tokens
   */
  const login = async (email: string, password: string): Promise<{ user: User; access: string; refresh: string }> => {
    try {
      setLoading(true);
      setError(null);

      const authResponse = await apiLogin(email, password);
      // Set user immediately - API response already contains user data
      setUser(authResponse.user ? { ...authResponse.user, role: normalizeRole(authResponse.user.role) } : null);
      // Set loading to false immediately after setting user to avoid delays
      setLoading(false);

      toast.success('Login successful!');
      return authResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(errorMessage);
      setLoading(false);
      toast.error(errorMessage);
      throw err; // Re-throw to allow caller to handle
    }
  };

  /**
   * Register new user (now returns success message instead of tokens)
   * @param userData - Registration data (email, password, password2, etc.)
   * @returns Registration response with message
   */
  const register = async (userData: RegisterData): Promise<{ message: string; email: string }> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiRegister(userData);
      // Registration now returns a message instead of logging user in
      // User must verify email before they can log in
      setLoading(false);

      toast.success(response.message || 'Registration successful! Please check your email.');
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(errorMessage);
      setLoading(false);
      toast.error(errorMessage);
      throw err; // Re-throw to allow caller to handle
    }
  };

  /**
   * Logout user, clear tokens, and reset state
   * Note: Navigation should be handled by the component calling logout
   */
  const logout = async (): Promise<void> => {
    // Clear state immediately for instant logout
    setUser(null);
    removeTokens();
    setLoading(false);
    
    // Call API in background (don't wait for it)
    apiLogout().catch((err) => {
      console.error('Logout API error (non-blocking):', err);
    });
    
    toast.success('Logged out successfully');
  };

  /**
   * Update current user profile
   * @param userData - Partial user data to update
   */
  const updateUser = async (userData: Partial<User>): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const updatedUser = await apiUpdateProfile(userData);
      setUser(updatedUser ? { ...updatedUser, role: normalizeRole(updatedUser.role) } : null);

      toast.success('Profile updated successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err; // Re-throw to allow caller to handle
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear error message
   */
  const clearError = (): void => {
    setError(null);
  };

  /**
   * Redirect to Dashboard Helper
   * 
   * Returns the dashboard path for the current user's role.
   * Components should use this with their navigate function.
   * 
   * REDIRECT LOGIC:
   * - Admin users → /admin
   * - Player users → /player
   * - Scout users → /scout
   * - No user/invalid → /login
   * 
   * Usage in components:
   * ```tsx
   * const { redirectToDashboard } = useAuth();
   * const navigate = useNavigate();
   * navigate(redirectToDashboard());
   * ```
   * 
   * Or simply use getDashboardPath(user?.role) directly with navigate.
   * 
   * @returns Dashboard path string for current user's role
   */
  const redirectToDashboard = (): string => {
    return getDashboardPath(user?.role);
  };

  /**
   * Check authentication status on component mount
   * This ensures user is loaded if they have a valid token
   * But only if we don't already have user data (optimized for login flow)
   */
  useEffect(() => {
    // If we already have user from localStorage and token is valid, skip API call
    // This prevents the 2-second delay after login
    if (user && isAuthenticated()) {
      setLoading(false);
      return;
    }
    // Only make API call if we don't have user data
    // This happens on app refresh or first visit
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run on mount

  /**
   * Computed value: isAuthenticated
   * True if user exists and token is valid
   */
  const isAuthenticatedValue = user !== null && isAuthenticated();

  /**
   * Context value object
   * Contains all state and functions needed for authentication
   */
  const value: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated: isAuthenticatedValue,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
    clearError,
    redirectToDashboard,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth Hook
 * Provides easy access to auth context
 * Must be used within AuthProvider
 * 
 * @throws Error if used outside AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthContext is intentionally not exported to maintain Fast Refresh compatibility
// Use the useAuth hook instead: import { useAuth } from './context/AuthContext'
