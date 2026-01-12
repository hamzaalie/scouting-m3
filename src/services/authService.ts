import axios, { AxiosError } from 'axios';
import { STORAGE_KEYS } from '../utils/constants';
import { isTokenExpired } from '../utils/helpers';

/**
 * API Base URL - uses environment variable or defaults to localhost
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:3000/api';

/**
 * User interface matching backend UserSerializer
 */
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'player' | 'scout';
  phone?: string;
  profile_picture?: string;
  date_joined: string;
  is_active: boolean;
  full_name?: string;
}

/**
 * Registration data interface
 */
export interface RegisterData {
  email: string;
  password: string;
  password2: string;
  first_name?: string;
  last_name?: string;
  role?: 'admin' | 'player' | 'scout';
  phone?: string;
}

/**
 * Login data interface
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * Auth response interface from Central Backend
 */
export interface CentralAuthResponse {
  user: {
    id: number;
    email: string;
    emailVerified: boolean;
    roles: string[];
    createdAt: string;
  };
  accessToken: string;
  refreshToken: string;
}

/**
 * Auth response interface (legacy M3 format)
 */
export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

/**
 * Password change data interface
 */
export interface ChangePasswordData {
  old_password: string;
  new_password: string;
  new_password2: string;
}

/**
 * Password reset request data interface
 */
export interface PasswordResetData {
  email: string;
}

/**
 * API Error response interface
 */
export interface ApiError {
  error?: string;
  details?: Record<string, string[] | string>;
  message?: string;
  [key: string]: unknown;
}

/**
 * Flag to prevent multiple simultaneous refresh attempts
 */
let isRefreshing = false;

/**
 * Queue of failed requests waiting for token refresh
 */
let failedQueue: Array<{
  resolve: (value?: string | null) => void;
  reject: (error?: Error) => void;
}> = [];

/**
 * Process queued requests after token refresh
 */
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * Create axios instance for authentication API calls (Central Backend)
 */
const authApi = axios.create({
  baseURL: AUTH_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor: Add Bearer token to all requests
 * Automatically attaches the access token from localStorage to Authorization header
 */
authApi.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // If sending FormData, remove Content-Type header so Axios sets it with boundary
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor: Handle 401 errors and token refresh
 * When a 401 is received:
 * 1. Attempt to refresh the token
 * 2. Retry the original request with new token
 * 3. If refresh fails, clear tokens and redirect to login
 */
authApi.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    // Skip refresh logic for auth endpoints (login/register/password reset) so real errors surface
    const skipRefresh = originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/password-reset');
    if (skipRefresh) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return authApi(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          // Nothing to refresh with; clear state and bubble up
          removeTokens();
          return Promise.reject(error);
        }

        // Attempt to refresh the token
        const response = await axios.post<{ access: string }>(
          `${API_URL}/users/auth/token/refresh/`,
          {
            refresh: refreshToken,
          }
        );

        const { access } = response.data;

        // Update tokens
        setTokens(access, refreshToken);

        // Process queued requests
        processQueue(null, access);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }
        return authApi(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        processQueue(new Error('Token refresh failed'), null);
        removeTokens();

        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Token Management Functions
 */

/**
 * Save access and refresh tokens to localStorage
 * @param access - Access token
 * @param refresh - Refresh token
 */
export const setTokens = (access: string, refresh: string): void => {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh);
};

/**
 * Get access token from localStorage
 * @returns Access token or null if not found
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

/**
 * Get refresh token from localStorage
 * @returns Refresh token or null if not found
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
};

/**
 * Remove tokens from localStorage
 */
export const removeTokens = (): void => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
};

/**
 * Check if user is authenticated (has valid token)
 * @returns true if token exists and is not expired
 */
export const isAuthenticated = (): boolean => {
  const token = getAccessToken();
  if (!token) {
    return false;
  }
  return !isTokenExpired(token);
};

/**
 * Format API errors into user-friendly messages
 * @param error - Axios error or API error response
 * @returns User-friendly error message
 */
const formatError = (error: unknown): string => {
  if (axios.isAxiosError<ApiError>(error)) {
    // Network error (backend not reachable, CORS, etc.)
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      // Log error silently to console instead of showing to user
      console.debug('Network error - backend may be starting up');
      return 'Please check your connection and try again.';
    }

    // Connection refused
    if (error.code === 'ECONNREFUSED') {
      console.debug('Connection refused - backend may be starting up');
      return 'Please check your connection and try again.';
    }

    const apiError = error.response?.data;

    // Handle field-specific validation errors (DRF format)
    if (apiError?.details) {
      // Handle field-specific errors (e.g., {email: ["This field is required."]})
      const detailMessages = Object.entries(apiError.details)
        .map(([field, messages]) => {
          const msgArray = Array.isArray(messages) ? messages : [messages];
          return `${field}: ${msgArray.join(', ')}`;
        })
        .join('; ');
      if (detailMessages) {
        return `${apiError?.error || 'Validation failed'}: ${detailMessages}`;
      }
    }

    // Handle direct error messages
    if (apiError?.error) {
      return apiError.error;
    }

    // Handle DRF-style error format (e.g., {email: ["This field is required."]})
    if (error.response?.data && typeof error.response.data === 'object') {
      const fieldErrors = Object.entries(error.response.data)
        .filter(([key]) => key !== 'error' && key !== 'details')
        .map(([field, messages]) => {
          const msgArray = Array.isArray(messages) ? messages : [messages];
          return `${field}: ${msgArray.join(', ')}`;
        });
      if (fieldErrors.length > 0) {
        return fieldErrors.join('; ');
      }
    }
    if (error.response?.status === 401) {
      return 'Unauthorized. Please log in again.';
    }
    if (error.response?.status === 403) {
      return 'You do not have permission to perform this action.';
    }
    if (error.response?.status === 404) {
      return 'The requested resource was not found.';
    }
    if (error.response?.status === 500) {
      return 'Server error. Please try again later.';
    }

    // Show the actual error message if available
    return error.response?.data?.message || error.message || 'An unexpected error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

/**
 * Authentication Service Functions
 */

/**
 * Register a new user
 * @param userData - Registration data (email, password, password2, optional fields)
 * @returns Message and email (no tokens until email verified)
 * @throws Error if registration fails
 */
export const register = async (userData: RegisterData): Promise<{ message: string; email: string }> => {
  try {
    console.log('Registering user with data:', { ...userData, password: '***', password2: '***' });
    
    // Send the role as-is to Central Backend
    // Backend will handle the mapping: player -> limited_user, scout -> subscriber, admin -> super_admin
    const registerData = {
      email: userData.email,
      password: userData.password,
      role: userData.role, // Send role directly: 'player', 'scout', or 'admin'
      platform: 'm3' as const, // Specify m3 platform for correct verification URL
    };

    const response = await authApi.post<{ message: string; user: { email: string } }>('/auth/register', registerData);

    console.log('Registration successful:', response.data.user.email);
    return {
      message: response.data.message,
      email: response.data.user.email,
    };
  } catch (error) {
    console.error('Registration error:', error);
    throw new Error(formatError(error));
  }
};

/**
 * Login with email and password
 * @param email - User email
 * @param password - User password
 * @returns Auth response with user data and tokens
 * @throws Error if login fails
 */
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const loginData = { email, password };
    console.log('Logging in user:', email);
    console.log('Login request data:', { ...loginData, password: '***' });
    const response = await authApi.post<CentralAuthResponse>('/auth/login', loginData);

    // Support both central (accessToken/refreshToken) and Django (access/refresh) shapes
    const accessToken = response.data.accessToken || (response.data as unknown as { access: string }).access;
    const refreshToken = response.data.refreshToken || (response.data as unknown as { refresh: string }).refresh;

    if (!accessToken || !refreshToken) {
      throw new Error('Login response missing tokens');
    }

    // Save tokens
    setTokens(accessToken, refreshToken);

    // Decode JWT to get roles from central backend
    let mappedRole: 'admin' | 'player' | 'scout' = 'player'; // default
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1])) as { roles?: string[] };
      console.log('JWT payload:', payload);
      
      // Role mapping: central backend roles -> M3 roles
      // Admin roles (super_admin, support_admin, read_only_admin) -> admin
      // Subscriber -> scout
      // Limited_user -> player
      const roles = payload.roles || [];
      const adminRoles = ['super_admin', 'support_admin', 'read_only_admin'];
      
      if (roles.some((r: string) => adminRoles.includes(r))) {
        mappedRole = 'admin';
      } else if (roles.includes('subscriber')) {
        mappedRole = 'scout';
      } else if (roles.includes('limited_user')) {
        mappedRole = 'player';
      }
      
      console.log('User roles from JWT:', roles, '-> Mapped to M3 role:', mappedRole);
    } catch (e) {
      console.warn('Failed to decode JWT:', e);
    }

    // Convert CentralAuthResponse user to User type with mapped role
    const centralUser = response.data.user;
    const user: User = {
      id: centralUser.id,
      email: centralUser.email,
      first_name: '',
      last_name: '',
      role: mappedRole,
      date_joined: centralUser.createdAt,
      is_active: centralUser.emailVerified,
    };

    // Save user data with role
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

    console.log('Login successful:', user.email, 'Role:', user.role);
    return {
      user: user as User,
      access: accessToken,
      refresh: refreshToken,
    };
  } catch (error) {
    console.error('Login error:', error);
    throw new Error(formatError(error));
  }
};

/**
 * Logout current user
 * Clears tokens from localStorage
 * @throws Error if logout fails
 */
export const logout = async (): Promise<void> => {
  try {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      // Central Backend logout endpoint
      await authApi.post('/auth/logout', {
        refreshToken: refreshToken,
      });
    }
  } catch (error) {
    // Even if logout fails on server, clear local tokens
    console.error('Logout error:', error);
  } finally {
    // Always clear local tokens
    removeTokens();
  }
};

/**
 * Get current authenticated user data
 * @returns User object
 * @throws Error if request fails or user not authenticated
 */
export const getCurrentUser = async (): Promise<User> => {
  try {
    console.log('[authService] 🔍 getCurrentUser: Fetching user data from central backend...');
    
    // Get token and decode to extract role (most reliable source)
    const token = getAccessToken();
    let mappedRole: 'admin' | 'player' | 'scout' = 'player'; // default
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1])) as { 
          userId: string;
          email: string;
          roles?: string[];
        };
        console.log('[authService] JWT payload:', payload);
        
        // Role mapping: central backend roles -> M3 roles
        const roles = payload.roles || [];
        const adminRoles = ['super_admin', 'support_admin', 'read_only_admin'];
        
        if (roles.some((r: string) => adminRoles.includes(r))) {
          mappedRole = 'admin';
        } else if (roles.includes('subscriber')) {
          mappedRole = 'scout';
        } else if (roles.includes('limited_user')) {
          mappedRole = 'player';
        }
        
        console.log('[authService] Decoded role from JWT:', roles, '-> Mapped to:', mappedRole);
      } catch (e) {
        console.warn('[authService] Failed to decode JWT:', e);
      }
    }
    
    // Fetch user data from backend
    const response = await authApi.get<{ 
      id: string; 
      email: string; 
      first_name?: string; 
      last_name?: string;
      phone_number?: string;
      phone?: string;
      profile_picture?: string;
      created_at?: string;
      date_joined?: string;
      email_verified?: boolean;
      roles?: { role: string }[];
    }>('/users/me');
    
    console.log('[authService] ✅ Backend response:', response.data);

    // Build user object with role from JWT (not from backend response)
    const user: User = {
      id: parseInt(response.data.id, 10),
      email: response.data.email,
      first_name: response.data.first_name || '',
      last_name: response.data.last_name || '',
      role: mappedRole, // Use role from JWT
      phone: response.data.phone_number || response.data.phone,
      profile_picture: response.data.profile_picture,
      date_joined: response.data.created_at || response.data.date_joined || new Date().toISOString(),
      is_active: response.data.email_verified !== false,
    };

    // Save user data with correct role
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    
    console.log('[authService] ✅ User data built with role:', user.role);

    return user;
  } catch (error) {
    console.error('[authService] ❌ getCurrentUser: Failed!', error);
    if (axios.isAxiosError(error)) {
      console.error('[authService] Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
    }
    throw new Error(formatError(error));
  }
};
/**
 * Account details interface
 */
/**
 * Payment record interface
 */
export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  [key: string]: unknown;
}

/**
 * Invoice record interface
 */
export interface Invoice {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  [key: string]: unknown;
}

/**
 * Account details interface
 */
export interface AccountDetails {
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    roles: string[];
    createdAt: string;
  };
  subscription: {
    status: string;
    isActive: boolean;
    startsAt: string | null;
    expiresAt: string | null;
    renewalDate: string | null;
    autoRenew: boolean;
    daysRemaining: number | null;
  };
  payments: Payment[];
  invoices: Invoice[];
  stats: {
    totalPayments: number;
    totalSpent: number;
    activeSince: string | null;
    lastPaymentDate: string | null;
  };
}

/**
 * Get comprehensive account details including subscription, payments, and invoices
 * @returns Complete account information
 * @throws Error if request fails
 */
export const getAccountDetails = async (): Promise<AccountDetails> => {
  try {
    // Call central backend for account details
    const centralToken = getAccessToken();
    const response = await axios.get<AccountDetails>(`${AUTH_URL}/users/account`, {
      headers: {
        Authorization: `Bearer ${centralToken}`,
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(formatError(error));
  }
};
/**
 * Update user profile
 * @param userData - Profile data to update (first_name, last_name, phone, profile_picture)
 * @returns Updated user object
 * @throws Error if update fails
 */
export const updateProfile = async (userData: Partial<User> | FormData): Promise<User> => {
  try {
    // Send data (interceptor will handle Content-Type for FormData)
    const response = await authApi.patch<User>('/users/auth/update-profile/', userData);

    // Update stored user data
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data));

    return response.data;
  } catch (error) {
    throw new Error(formatError(error));
  }
};

/**
 * Change user password
 * @param passwordData - Old password, new password, and confirmation
 * @returns Success message
 * @throws Error if password change fails
 */
export const changePassword = async (passwordData: ChangePasswordData): Promise<{ message: string }> => {
  try {
    const response = await authApi.post<{ message: string }>('/users/auth/change-password/', passwordData);
    return response.data;
  } catch (error) {
    throw new Error(formatError(error));
  }
};

/**
 * Request password reset
 * @param email - User email address
 * @returns Success message
 * @throws Error if request fails
 */
export const requestPasswordReset = async (email: string): Promise<{ message: string }> => {
  try {
    const response = await authApi.post<{ message: string }>('/users/auth/password-reset/', {
      email,
    });
    return response.data;
  } catch (error) {
    throw new Error(formatError(error));
  }
};

/**
 * Refresh access token using refresh token
 * This is called automatically by the interceptor, but can be called manually if needed
 * @returns New access token
 * @throws Error if refresh fails
 */
export const refreshToken = async (): Promise<string> => {
  try {
    const refreshTokenValue = getRefreshToken();
    if (!refreshTokenValue) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post<{ access: string }>(`${API_URL}/users/auth/token/refresh/`, {
      refresh: refreshTokenValue,
    });

    const { access } = response.data;

    // Update access token
    setTokens(access, refreshTokenValue);

    return access;
  } catch (error) {
    removeTokens();
    throw new Error(formatError(error));
  }
};

/**
 * Default export of authApi instance for use in other services
 */
export default authApi;

