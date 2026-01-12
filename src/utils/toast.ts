import toast from 'react-hot-toast';

/**
 * Toast Utility Functions
 * 
 * Custom toast functions with consistent styling and icons.
 * All toasts use react-hot-toast with custom configurations.
 */

/**
 * Show a success toast notification
 * @param message - Success message to display
 * @param duration - Duration in milliseconds (default: 3000)
 */
export const showSuccess = (message: string, duration: number = 3000) => {
  return toast(message, {
    duration,
    icon: undefined,
    style: {
      background: '#10b981',
      color: '#fff',
      borderRadius: '0.5rem',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
  });
};

/**
 * Show an error toast notification
 * @param message - Error message to display
 * @param duration - Duration in milliseconds (default: 4000)
 */
export const showError = (message: string, duration: number = 4000) => {
  return toast(message, {
    duration,
    icon: undefined,
    style: {
      background: '#ef4444',
      color: '#fff',
      borderRadius: '0.5rem',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
  });
};

/**
 * Show an info toast notification
 * @param message - Info message to display
 * @param duration - Duration in milliseconds (default: 3000)
 */
export const showInfo = (message: string, duration: number = 3000) => {
  return toast(message, {
    duration,
    icon: 'ℹ️',
    style: {
      background: '#3b82f6',
      color: '#fff',
      borderRadius: '0.5rem',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#3b82f6',
    },
  });
};

/**
 * Show a warning toast notification
 * @param message - Warning message to display
 * @param duration - Duration in milliseconds (default: 3500)
 */
export const showWarning = (message: string, duration: number = 3500) => {
  return toast(message, {
    duration,
    icon: '⚠️',
    style: {
      background: '#f59e0b',
      color: '#fff',
      borderRadius: '0.5rem',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#f59e0b',
    },
  });
};

/**
 * Show a loading toast notification
 * @param message - Loading message to display
 * @returns Toast ID (can be used with toast.dismiss() or toast.promise())
 */
export const showLoading = (message: string = 'Loading...') => {
  return toast.loading(message, {
    style: {
      background: '#fff',
      color: '#363636',
      borderRadius: '0.5rem',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
  });
};

/**
 * Dismiss a toast by ID
 * @param toastId - Toast ID to dismiss
 */
export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};

/**
 * Dismiss all toasts
 */
export const dismissAllToasts = () => {
  toast.dismiss();
};

/**
 * Promise-based toast (automatically shows loading, success, or error)
 * @param promise - Promise to track
 * @param messages - Messages for different states
 */
export const showPromise = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: any) => string);
  }
) => {
  return toast.promise(promise, messages, {
    style: {
      background: '#fff',
      color: '#363636',
      borderRadius: '0.5rem',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    success: {
      icon: '✅',
      iconTheme: {
        primary: '#10b981',
        secondary: '#fff',
      },
    },
    error: {
      icon: '❌',
      iconTheme: {
        primary: '#ef4444',
        secondary: '#fff',
      },
    },
  });
};

// Re-export default toast for advanced usage
export { toast };
export default {
  success: showSuccess,
  error: showError,
  info: showInfo,
  warning: showWarning,
  loading: showLoading,
  dismiss: dismissToast,
  dismissAll: dismissAllToasts,
  promise: showPromise,
};

